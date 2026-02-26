import { supabase } from "@/utils/supabase";

export const createPersonnelUser = async (
  email: string,
  password: string,
  profile: any
) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || "";

  // Step 1: Create auth user via Supabase Admin REST API
  const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
    }),
  });

  const authData = await authRes.json();

  if (!authRes.ok) {
    throw new Error(authData?.msg || authData?.message || "Failed to create auth user");
  }

  const userId = authData.id;

  // Step 2: Insert profile into PersonnelProfiles via REST API
  const profileRes = await fetch(`${supabaseUrl}/rest/v1/PersonnelProfiles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      id: userId,
      email: profile.email || email,
      password: profile.password || password,
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      phone_number: profile.phone_number || "",
      address: profile.address || "",
    }),
  });

  const profileData = await profileRes.json();

  if (!profileRes.ok) {
    // Cleanup: delete orphan auth user
    await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    const errMsg = Array.isArray(profileData) ? profileData[0]?.message : profileData?.message;
    throw new Error("Profile creation failed: " + (errMsg || "Unknown error"));
  }

  return { profileData, userID: userId };
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || "";

  // Update auth user
  const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      email: updatedRecord.email,
      password: updatedRecord.password,
    }),
  });

  if (!authRes.ok) {
    const authData = await authRes.json();
    throw new Error(authData?.msg || authData?.message || "Failed to update auth user");
  }

  // Update profile
  const profileRes = await fetch(
    `${supabaseUrl}/rest/v1/PersonnelProfiles?id=eq.${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(updatedRecord),
    }
  );

  const profileData = await profileRes.json();

  if (!profileRes.ok) {
    throw new Error("Failed to update personnel profile");
  }

  return profileData;
};

export const deletePersonnelUserRecord = async (id: string) => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || "";

    // Delete profile first
    await fetch(`${supabaseUrl}/rest/v1/PersonnelProfiles?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });

    // Delete auth user
    await fetch(`${supabaseUrl}/auth/v1/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });

    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return null;
  }
};
