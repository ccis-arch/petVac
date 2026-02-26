const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function supaFetch(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      ...(opts.headers || {}),
    },
  });
  return res;
}

async function main() {
  // Get all profile IDs from both tables
  const [ownerRes, personnelRes] = await Promise.all([
    supaFetch("/rest/v1/PetOwnerProfiles?select=id"),
    supaFetch("/rest/v1/PersonnelProfiles?select=id"),
  ]);
  const owners = await ownerRes.json();
  const personnel = await personnelRes.json();
  const profileIds = new Set([
    ...owners.map((o) => o.id),
    ...personnel.map((p) => p.id),
  ]);
  console.log("Profile IDs found:", profileIds.size);

  // Paginate through ALL auth users
  let page = 1;
  let orphans = [];
  while (true) {
    const res = await supaFetch(`/auth/v1/admin/users?page=${page}&per_page=100`);
    const data = await res.json();
    const users = data.users || data;
    if (!Array.isArray(users) || users.length === 0) break;

    for (const u of users) {
      if (!profileIds.has(u.id)) {
        orphans.push({ id: u.id, email: u.email });
      }
    }
    if (users.length < 100) break;
    page++;
  }

  console.log(`Found ${orphans.length} orphaned auth users`);
  for (const o of orphans) {
    console.log(`  Deleting orphan: ${o.email} (${o.id})`);
    await supaFetch(`/auth/v1/admin/users/${o.id}`, { method: "DELETE" });
  }
  console.log("Cleanup complete");
}

main().catch(console.error);
