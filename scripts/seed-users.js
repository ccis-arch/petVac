import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUser(email, password, role) {
  // Check if user already exists by trying to find them
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === email);
  if (existing) {
    console.log(`User ${email} already exists with id: ${existing.id}`);
    return existing;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error(`Error creating ${role} user (${email}):`, error.message);
    return null;
  }

  console.log(`Created ${role} user: ${email} (id: ${data.user.id})`);
  return data.user;
}

async function main() {
  console.log("--- Creating test accounts ---\n");

  // 1. ADMIN account (no profile row needed - the system treats users
  //    that are NOT in PersonnelProfiles or PetOwnerProfiles as admins)
  const adminUser = await createUser("admin@petvac.com", "Admin@123", "admin");
  if (adminUser) {
    console.log("Admin account ready.\n");
  }

  // 2. PERSONNEL account
  const personnelUser = await createUser("personnel@petvac.com", "Personnel@123", "personnel");
  if (personnelUser) {
    // Insert personnel profile
    const { data: existingProfile } = await supabase
      .from("PersonnelProfiles")
      .select("id")
      .eq("id", personnelUser.id)
      .single();

    if (existingProfile) {
      console.log("Personnel profile already exists.\n");
    } else {
      const { error: profileError } = await supabase
        .from("PersonnelProfiles")
        .insert({
          id: personnelUser.id,
          first_name: "Juan",
          middle_name: "Santos",
          last_name: "Dela Cruz",
          sex: "Male",
          email: "personnel@petvac.com",
          password: "Personnel@123",
          phone_number: "09171234567",
          role: "Veterinarian",
        });

      if (profileError) {
        console.error("Error creating personnel profile:", profileError.message);
      } else {
        console.log("Personnel profile created.\n");
      }
    }
  }

  // 3. PET OWNER account
  const petOwnerUser = await createUser("petowner@petvac.com", "PetOwner@123", "pet-owner");
  if (petOwnerUser) {
    // Insert pet owner profile
    const { data: existingProfile } = await supabase
      .from("PetOwnerProfiles")
      .select("id")
      .eq("id", petOwnerUser.id)
      .single();

    if (existingProfile) {
      console.log("Pet owner profile already exists.\n");
    } else {
      const { error: profileError } = await supabase
        .from("PetOwnerProfiles")
        .insert({
          id: petOwnerUser.id,
          first_name: "Maria",
          middle_name: "Reyes",
          last_name: "Garcia",
          sex: "Female",
          email: "petowner@petvac.com",
          password: "PetOwner@123",
          phone_number: "09181234567",
          barangay: "Poblacion",
          purok_street: "Purok 1, Rizal St.",
        });

      if (profileError) {
        console.error("Error creating pet owner profile:", profileError.message);
      } else {
        console.log("Pet owner profile created.");

        // Add a sample pet for this owner
        const { error: petError } = await supabase
          .from("PetRecords")
          .insert({
            owner_id: petOwnerUser.id,
            pet_name: "Bantay",
            species: "Dog",
            breed: "Aspin",
            sex: "Male",
            color_markings: "Brown with white spots",
            age_years: 3,
            age_months: 6,
          });

        if (petError) {
          console.error("Error creating sample pet:", petError.message);
        } else {
          console.log("Sample pet 'Bantay' created for pet owner.\n");
        }
      }
    }
  }

  console.log("--- Summary ---");
  console.log("1. Admin:     admin@petvac.com     / Admin@123");
  console.log("2. Personnel: personnel@petvac.com / Personnel@123");
  console.log("3. Pet Owner: petowner@petvac.com  / PetOwner@123");
  console.log("\nAll accounts are ready to use!");
}

main().catch(console.error);
