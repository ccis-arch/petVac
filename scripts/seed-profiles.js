const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

async function supabaseRequest(table, method, body, query = "") {
  const url = `${supabaseUrl}/rest/v1/${table}${query}`;
  const headers = {
    apikey: supabaseServiceKey,
    Authorization: `Bearer ${supabaseServiceKey}`,
    "Content-Type": "application/json",
    Prefer: method === "POST" ? "return=representation,resolution=merge-duplicates" : "return=representation",
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${method} ${table} failed (${res.status}): ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

async function seedProfiles() {
  console.log("--- Inserting profiles for existing users ---\n");

  // User IDs from previous auth user creation
  const personnelId = "97a362d9-f8ec-48ad-ad2a-99b427826318";
  const petOwnerId = "425edff0-cc9d-4821-80de-a5aff78cd156";

  // 1. Insert PersonnelProfiles
  try {
    const result = await supabaseRequest("PersonnelProfiles", "POST", {
      id: personnelId,
      first_name: "Juan",
      last_name: "Dela Cruz",
      email: "personnel@petvac.com",
      phone_number: "09171234567",
      address: "City Veterinary Office, Legazpi City",
      password: "Personnel@123",
    });
    console.log("Personnel profile created successfully for:", personnelId);
  } catch (err) {
    console.error("Error creating personnel profile:", err.message);
  }

  // 2. Insert PetOwnerProfiles
  try {
    const result = await supabaseRequest("PetOwnerProfiles", "POST", {
      id: petOwnerId,
      first_name: "Maria",
      last_name: "Santos",
      email: "petowner@petvac.com",
      phone_number: "09181234567",
      gender: "Female",
      birth_date: "1990-05-15",
      barangay: "Bagumbayan",
      date_registered: new Date().toISOString().split("T")[0],
      password: "PetOwner@123",
    });
    console.log("Pet owner profile created successfully for:", petOwnerId);
  } catch (err) {
    console.error("Error creating pet owner profile:", err.message);
  }

  // 3. Insert a sample PetRecord for the pet owner
  try {
    const petId = crypto.randomUUID();
    const result = await supabaseRequest("PetRecords", "POST", {
      id: petId,
      owner_id: petOwnerId,
      pet_name: "Bantay",
      specie: "Dog",
      breed: "Aspin",
      sex: "Male",
      color: "Brown",
      weight: 12,
      birth_date: "2023-01-10",
      tag: "None",
      ownership: "Owned",
      habitat: "Indoor",
      pet_origin: "Born in household",
      is_pregnant: false,
      is_lactating_with_puppies: false,
      num_puppies: 0,
      date_vaccinated: null,
    });
    console.log("Pet record created successfully: Bantay (id:", petId + ")");
  } catch (err) {
    console.error("Error creating pet record:", err.message);
  }

  console.log("\n--- Summary ---");
  console.log("1. Admin:     admin@petvac.com     / Admin@123       (no profile table - admin role)");
  console.log("2. Personnel: personnel@petvac.com / Personnel@123   (PersonnelProfiles row created)");
  console.log("3. Pet Owner: petowner@petvac.com  / PetOwner@123    (PetOwnerProfiles + PetRecords created)");
  console.log("\nAll accounts are ready to use!");
}

seedProfiles().catch(console.error);
