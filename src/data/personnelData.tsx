import { supabase } from "@/utils/supabase";

export const createPersonnelUser = async (
  email: string,
  password: string,
  profile: any
) => {
  const response = await fetch("/api/admin/personnel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, profile }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to create personnel user");
  }

  return { profileData: result.profileData, userID: result.userID };
};

export const fetchPersonnelUserRecord = async (
  searchValue: string,
  entriesPerPage: number,
  currentPage: number
) => {
  const offset = (currentPage - 1) * entriesPerPage;

  try {
    let query = supabase
      .from("PersonnelProfiles")
      .select(
        `
        *
      `,
        { count: "exact" }
      )
      .order("last_name", { ascending: false })
      .order("first_name", { ascending: false });

    if (searchValue) {
      query = query.or(
        `email.ilike.%${searchValue}%,last_name.ilike.%${searchValue}%,first_name.ilike.%${searchValue}%,address.ilike.%${searchValue}%`
      );
    }

    const response = await query.range(offset, offset + entriesPerPage - 1);

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const editPersonnelUserRecord = async (
  id: string,
  updatedRecord: { email: string; password: string }
) => {
  const response = await fetch("/api/admin/personnel", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, updatedRecord }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to update personnel user");
  }

  return result.data;
};

export const deletePersonnelUserRecord = async (id: string) => {
  try {
    const response = await fetch("/api/admin/personnel", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to delete personnel user");
    }

    return result.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    return null;
  }
};
