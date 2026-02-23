import { supabase, supabaseAdmin } from "@/utils/supabase";

export const createPersonnelUser = async (
  email: string,
  password: string,
  profile: any
) => {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    throw error;
  }

  const user = data?.user;

  if (user) {
    const { data: profileData, error: insertError } = await supabase
      .from("PersonnelProfiles")
      .insert({
        id: user.id,
        ...profile,
      });

    if (insertError) {
      throw insertError;
    }

    return { profileData, userID: user.id };
  }
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
  const { data: user, error } = await supabaseAdmin.auth.admin.updateUserById(
    id,
    {
      email: updatedRecord.email,
      password: updatedRecord.password,
    }
  );

  if (error) {
    throw error;
  }

  if (user) {
    try {
      const { data, error } = await supabase
        .from("PersonnelProfiles")
        .update(updatedRecord)
        .eq("id", id);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error updating personnel user record:", error);
      return null;
    }
  }
};

export const deletePersonnelUserRecord = async (id: string) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error deleting user:", error);
    return null;
  }
};
