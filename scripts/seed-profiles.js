import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedProfiles() {
  console.log("--- Inserting profiles for existing users ---\n");

  // Personnel user ID from previous run
  const personnelId = "97a362d9-f8ec-48ad-ad2a-99b427826318";
  // Pet owner user ID from previous run
  const petOwnerId = "425edff0-cc9d-4821-80de-a5aff78cd156";

  // 1. Insert PersonnelProfiles
  // Columns: id, first_name, last_name, email, phone_number, address, password
  const { data: personnelProfile, error: personnelError } = await supabase
    .from("PersonnelProfiles")
    .upsert({
      id: personnelId,
      first_name: "Juan",
      last_name: "Dela Cruz",
      email: "personnel@petvac.com",
      phone_number: "09171234567",
      address: "City Veterinary Office, Legazpi City",
      password: "Personnel@123",
    }, { onConflict: "id" })
    .select();

  if (personnelError) {
    console.error("Error creating personnel profile:", personnelError.message);
  } else {
    console.log("Personnel profile created successfully for:", personnelId);
  }

  // 2. Insert PetOwnerProfiles
  // Columns: id, first_name, last_name, email, phone_number, gender, birth_date, barangay, date_registered, password
  const { data: ownerProfile, error: ownerError } = await supabase
    .from("PetOwnerProfiles")
    .upsert({
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
    }, { onConflict: "id" })
    .select();

  if (ownerError) {
    console.error("Error creating pet owner profile:", ownerError.message);
  } else {
    console.log("Pet owner profile created successfully for:", petOwnerId);
  }

  // 3. Insert a sample PetRecord for the pet owner
  // Columns: id, owner_id, pet_name, specie, breed, sex, color, weight, birth_date, tag, ownership, habitat, pet_origin, is_pregnant, is_lactating_with_puppies, num_puppies, date_vaccinated
  const petId = crypto.randomUUID();
  const { data: petRecord, error: petError } = await supabase
    .from("PetRecords")
    .insert({
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
    })
    .select();

  if (petError) {
    console.error("Error creating pet record:", petError.message);
  } else {
    console.log("Pet record created successfully:", petRecord[0]?.pet_name, "(id:", petId + ")");
  }

  console.log("\n--- Summary ---");
  console.log("1. Admin:     admin@petvac.com     / Admin@123       (no profile table - admin role)");
  console.log("2. Personnel: personnel@petvac.com / Personnel@123   (PersonnelProfiles row created)");
  console.log("3. Pet Owner: petowner@petvac.com  / PetOwner@123    (PetOwnerProfiles + PetRecords created)");
  console.log("\nAll accounts are ready to use!");
}

seedProfiles().catch(console.error);
