const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("SUPABASE_URL available:", !!SUPABASE_URL);
console.log("SERVICE_KEY available:", !!SUPABASE_SERVICE_KEY);
console.log("SERVICE_KEY length:", SUPABASE_SERVICE_KEY?.length);

async function testCreateUser() {
  const testEmail = "testuser_" + Date.now() + "@test.com";
  const testPassword = "TestPass@123";

  // Step 1: Create auth user
  console.log("\n--- Step 1: Creating auth user with email:", testEmail);
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
      "apikey": SUPABASE_SERVICE_KEY,
    },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    }),
  });

  const authData = await authRes.json();
  console.log("Auth response status:", authRes.status);
  
  if (!authRes.ok) {
    console.log("Auth error:", JSON.stringify(authData));
    return;
  }
  
  const userId = authData.id;
  console.log("Auth user created, ID:", userId);

  // Step 2: Insert profile
  console.log("\n--- Step 2: Inserting PetOwnerProfiles row");
  const profile = {
    id: userId,
    email: testEmail,
    password: testPassword,
    first_name: "Test",
    last_name: "User",
    gender: "Male",
    barangay: "Bagumbayan",
    phone_number: "09171234567",
    birth_date: "2000-01-15",
    date_registered: new Date().toISOString().split("T")[0],
  };
  console.log("Profile to insert:", JSON.stringify(profile));

  const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/PetOwnerProfiles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
      "apikey": SUPABASE_SERVICE_KEY,
      "Prefer": "return=representation",
    },
    body: JSON.stringify(profile),
  });

  const profileData = await profileRes.text();
  console.log("Profile insert status:", profileRes.status);
  console.log("Profile insert response:", profileData);

  if (profileRes.ok) {
    console.log("\nSUCCESS - registration works end-to-end!");
    
    // Cleanup: delete the test user
    console.log("\n--- Cleanup: Deleting test user");
    const delRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        "apikey": SUPABASE_SERVICE_KEY,
      },
    });
    console.log("Delete status:", delRes.status);
  } else {
    console.log("\nFAILED - profile insert error. Cleaning up auth user...");
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        "apikey": SUPABASE_SERVICE_KEY,
      },
    });
  }
}

testCreateUser().catch(console.error);
