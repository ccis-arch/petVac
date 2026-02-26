import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUsers() {
  // =====================
  // 1. ADMIN ACCOUNT
  // =====================
  console.log("Creating admin account...");
  const { data: adminAuth, error: adminAuthError } = await supabase.auth.admin.createUser({
    email: "admin@petvac.com",
    password: "Admin123!",
    email_confirm: true,
  });

  if (adminAuthError) {
    console.error("Admin auth error:", adminAuthError.message);
  } else {
    console.log("Admin account created:", adminAuth.user.id);
    // Admin is identified by NOT being in PersonnelProfiles or PetOwnerProfiles
    // so we do NOT insert a profile for them
  }

  // =====================
  // 2. PERSONNEL ACCOUNT
  // =====================
  console.log("\nCreating personnel account...");
  const { data: personnelAuth, error: personnelAuthError } = await supabase.auth.admin.createUser({
    email: "personnel@petvac.com",
    password: "Personnel123!",
    email_confirm: true,
  });

  if (personnelAuthError) {
    console.error("Personnel auth error:", personnelAuthError.message);
  } else {
    const personnelId = personnelAuth.user.id;
    console.log("Personnel auth created:", personnelId);

    const { error: personnelProfileError } = await supabase
      .from("PersonnelProfiles")
      .insert({
        id: personnelId,
        first_name: "Juan",
        last_name: "Dela Cruz",
        email: "personnel@petvac.com",
        password: "Personnel123!",
        phone_number: "09171234567",
        address: "Municipal Hall, Taguig City",
      });

    if (personnelProfileError) {
      console.error("Personnel profile error:", personnelProfileError.message);
    } else {
      console.log("Personnel profile created successfully");
    }
  }

  // =====================
  // 3. PET OWNER ACCOUNT
  // =====================
  console.log("\nCreating pet owner account...");
  const { data: ownerAuth, error: ownerAuthError } = await supabase.auth.admin.createUser({
    email: "petowner@petvac.com",
    password: "PetOwner123!",
    email_confirm: true,
  });

  if (ownerAuthError) {
    console.error("Pet owner auth error:", ownerAuthError.message);
  } else {
    const ownerId = ownerAuth.user.id;
    console.log("Pet owner auth created:", ownerId);

    const { error: ownerProfileError } = await supabase
      .from("PetOwnerProfiles")
      .insert({
        id: ownerId,
        first_name: "Maria",
        last_name: "Santos",
        email: "petowner@petvac.com",
        password: "PetOwner123!",
        phone_number: "09181234567",
        gender: "Female",
        birth_date: "1995-06-15",
        date_registered: new Date().toISOString().split("T")[0],
        barangay: "Bagumbayan",
      });

    if (ownerProfileError) {
      console.error("Pet owner profile error:", ownerProfileError.message);
    } else {
      console.log("Pet owner profile created successfully");

      // Also create a sample pet for this owner
      const { error: petError } = await supabase
        .from("PetRecords")
        .insert({
          owner_id: ownerId,
          pet_name: "Bantay",
          specie: "dog",
          sex: "Male",
          breed: "Aspin",
          birth_date: "2023-01-10",
          weight: 12,
          color: "Brown",
          pet_origin: "Born",
          ownership: "Owned",
          habitat: "Indoor",
          tag: "None",
          is_pregnant: false,
          is_lactating_with_puppies: false,
          num_puppies: 0,
          date_vaccinated: null,
        });

      if (petError) {
        console.error("Pet record error:", petError.message);
      } else {
        console.log("Sample pet 'Bantay' created for pet owner");
      }
    }
  }

  // =====================
  // SUMMARY
  // =====================
  console.log("\n========================================");
  console.log("  TEST ACCOUNTS CREATED SUCCESSFULLY");
  console.log("========================================");
  console.log("");
  console.log("  ADMIN:");
  console.log("    Email:    admin@petvac.com");
  console.log("    Password: Admin123!");
  console.log("    Role:     Select 'Admin' on sign in");
  console.log("");
  console.log("  PERSONNEL:");
  console.log("    Email:    personnel@petvac.com");
  console.log("    Password: Personnel123!");
  console.log("    Role:     Select 'Personnel' on sign in");
  console.log("");
  console.log("  PET OWNER:");
  console.log("    Email:    petowner@petvac.com");
  console.log("    Password: PetOwner123!");
  console.log("    Role:     Select 'Pet Owner' on sign in");
  console.log("========================================");
}

createUsers().catch(console.error);
