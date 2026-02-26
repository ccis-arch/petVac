import { supabase } from "../utils/supabase";

export async function getUserAndRole(sessionToken: string) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(sessionToken);

  if (error) {
    console.error("Error fetching user:", error.message);
    return { user: null, role: null };
  }

  if (!user) return { user: null, role: null };

  try {
    const { data: personnelData } = await supabase
      .from("PersonnelProfiles")
      .select("id")
      .eq("id", user.id);

    if (personnelData && personnelData.length > 0) {
      return { user, role: "personnel" };
    }

    const { data: petOwnerData } = await supabase
      .from("PetOwnerProfiles")
      .select("id")
      .eq("id", user.id);

    if (petOwnerData && petOwnerData.length > 0) {
      return { user, role: "pet-owner" };
    }

    return { user, role: "admin" };
  } catch (err) {
    console.error("Error checking role:", err);
    return { user, role: null };
  }
}
