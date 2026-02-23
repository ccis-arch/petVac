import { supabase, supabaseAdmin } from "../utils/supabase";

export async function getUserAndRole(sessionToken: string) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(sessionToken);

  if (error) {
    console.error("Error fetching user:", error.message);
    return { user: null, role: null };
  }

  const { data: personnelData } = await supabaseAdmin
    .from("PersonnelProfiles")
    .select("id")
    .eq("id", user?.id);

  if (personnelData && personnelData.length > 0) {
    return { user, role: "personnel" };
  }

  const { data: petOwnerData } = await supabase
    .from("PetOwnerProfiles")
    .select("id")
    .eq("id", user?.id);

  if (petOwnerData && petOwnerData.length > 0) {
    return { user, role: "pet-owner" };
  }

  const { data: adminData1 } = await supabaseAdmin
    .from("PersonnelProfiles")
    .select("id")
    .eq("id", user?.id);

  const { data: adminData2 } = await supabaseAdmin
    .from("PetOwnerProfiles")
    .select("id")
    .eq("id", user?.id);

  if (
    (adminData1 && adminData1.length) === 0 ||
    (adminData2 && adminData2.length === 0)
  ) {
    return { user, role: "admin" };
  }

  return { user, role: null };
}
