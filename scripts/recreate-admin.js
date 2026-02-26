const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  // Create admin auth user
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({
      email: "admin@petvac.com",
      password: "Admin@123",
      email_confirm: true,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.log("Error:", data?.msg || data?.message || JSON.stringify(data));
    return;
  }

  console.log("Admin user recreated:", data.id, data.email);
}

main();
