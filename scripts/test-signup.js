const SUPABASE_URL = process.env.SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testSignUp() {
  const testEmail = `test_signup_${Date.now()}@example.com`;

  console.log("=== Test 1: signUp via anon key (GoTrue) ===");
  const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
    },
    body: JSON.stringify({
      email: testEmail,
      password: "Test@12345",
    }),
  });
  const signupData = await signupRes.json();
  console.log("Status:", signupRes.status);
  console.log("Response:", JSON.stringify(signupData, null, 2));
  
  const userId = signupData.id || signupData.user?.id;
  console.log("User ID:", userId);
  console.log("Email confirmed:", signupData.email_confirmed_at || signupData.user?.email_confirmed_at || "NOT confirmed");

  // Try inserting a profile with the anon key using the session from signup
  if (signupData.access_token) {
    console.log("\n=== Test 2: Insert profile using session token ===");
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/PetOwnerProfiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY,
        Authorization: `Bearer ${signupData.access_token}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        id: userId,
        email: testEmail,
        password: "Test@12345",
        first_name: "Test",
        last_name: "User",
        gender: "Male",
        barangay: "Test",
        phone_number: "1234567890",
        birth_date: "2000-01-01",
        date_registered: new Date().toISOString().split("T")[0],
      }),
    });
    const profileData = await profileRes.json();
    console.log("Profile insert status:", profileRes.status);
    console.log("Profile data:", JSON.stringify(profileData, null, 2));
  } else {
    console.log("\nNo access_token in signup response - email confirmation likely required");
    console.log("Checking identities:", signupData.identities?.length || signupData.user?.identities?.length);
  }

  // Cleanup
  if (userId) {
    console.log("\n=== Cleanup ===");
    // Delete profile if created
    await fetch(`${SUPABASE_URL}/rest/v1/PetOwnerProfiles?id=eq.${userId}`, {
      method: "DELETE",
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    // Delete auth user
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    console.log("Cleaned up test user");
  }
}

testSignUp().catch(console.error);
