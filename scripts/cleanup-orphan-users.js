const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function supabaseAdminFetch(path, options = {}) {
  const url = `${SUPABASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      ...(options.headers || {}),
    },
  });
  return res;
}

async function main() {
  console.log("Fetching all auth users...");

  // List all auth users
  const usersRes = await supabaseAdminFetch("/auth/v1/admin/users?per_page=1000");
  const usersData = await usersRes.json();
  const users = usersData.users || [];
  console.log(`Found ${users.length} auth users`);

  // Get all pet owner profile IDs
  const ownersRes = await supabaseAdminFetch("/rest/v1/PetOwnerProfiles?select=id");
  const owners = await ownersRes.json();
  const ownerIds = new Set((owners || []).map((o) => o.id));
  console.log(`Found ${ownerIds.size} pet owner profiles`);

  // Get all personnel profile IDs
  const personnelRes = await supabaseAdminFetch("/rest/v1/PersonnelProfiles?select=id");
  const personnel = await personnelRes.json();
  const personnelIds = new Set((personnel || []).map((p) => p.id));
  console.log(`Found ${personnelIds.size} personnel profiles`);

  // Keep the 3 seeded accounts (admin, personnel, petowner)
  const seededEmails = new Set(["admin@petvac.com", "personnel@petvac.com", "petowner@petvac.com"]);

  let deletedCount = 0;
  for (const user of users) {
    if (seededEmails.has(user.email)) {
      console.log(`Keeping seeded user: ${user.email}`);
      continue;
    }

    const hasOwnerProfile = ownerIds.has(user.id);
    const hasPersonnelProfile = personnelIds.has(user.id);

    if (!hasOwnerProfile && !hasPersonnelProfile) {
      console.log(`Deleting orphan: ${user.email} (${user.id})`);
      const delRes = await supabaseAdminFetch(`/auth/v1/admin/users/${user.id}`, {
        method: "DELETE",
      });
      if (delRes.ok) {
        deletedCount++;
      } else {
        console.log(`  Failed to delete: ${delRes.status}`);
      }
    }
  }

  console.log(`\nDone! Deleted ${deletedCount} orphaned auth users.`);
}

main().catch(console.error);
