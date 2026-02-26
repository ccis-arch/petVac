import { supabase } from "@/utils/supabase";
import { PetOwner } from "@/types/interfaces";

export const createPetOwnerUser = async (
  email: string,
  password: string,
  profile: any
) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || "";

  // Step 1: Create auth user via Admin REST API (bypasses email confirmation)
  const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });

  const authData = await authRes.json();

  // If user already exists but might be orphaned, try to clean up and retry
  if (!authRes.ok && authData?.msg?.includes("already been registered")) {
    // Look up existing user by email
    const listRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1000`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    );
    const listData = await listRes.json();
    const users = listData?.users || listData || [];
    const existing = users.find?.((u: any) => u.email === email);

    if (existing) {
      // Check if they have a profile
      const profileRes = await fetch(
        `${supabaseUrl}/rest/v1/PetOwnerProfiles?id=eq.${existing.id}&select=id`,
        {
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
          },
        }
      );
      const profileRows = await profileRes.json();

      if (!profileRows || profileRows.length === 0) {
        // Orphan: delete and retry
        await fetch(`${supabaseUrl}/auth/v1/admin/users/${existing.id}`, {
          method: "DELETE",
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
          },
        });

        // Retry creation
        const retryRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({ email, password, email_confirm: true }),
        });

        const retryData = await retryRes.json();
        if (!retryRes.ok) {
          throw new Error(retryData?.msg || retryData?.message || "Failed to create user after cleanup");
        }
        // Use the retried user
        return await insertPetOwnerProfile(supabaseUrl, serviceKey, retryData.id, email, password, profile);
      } else {
        throw new Error("A user with this email already exists and has a profile.");
      }
    }
    throw new Error(authData?.msg || "A user with this email already exists.");
  }

  if (!authRes.ok) {
    throw new Error(authData?.msg || authData?.message || "Failed to create user");
  }

  return await insertPetOwnerProfile(supabaseUrl, serviceKey, authData.id, email, password, profile);
};

async function insertPetOwnerProfile(
  supabaseUrl: string,
  serviceKey: string,
  userId: string,
  email: string,
  password: string,
  profile: any
) {
  const profileToInsert = {
    id: userId,
    email: profile.email || email,
    password: profile.password || password,
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    gender: profile.gender || "",
    barangay: profile.barangay || "",
    phone_number: profile.phone_number || "",
    birth_date: profile.birth_date || null,
    date_registered: new Date().toISOString().split("T")[0],
  };

  const profileRes = await fetch(`${supabaseUrl}/rest/v1/PetOwnerProfiles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify(profileToInsert),
  });

  const profileData = await profileRes.json();

  if (!profileRes.ok) {
    // Cleanup orphan auth user
    await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    const errMsg = Array.isArray(profileData)
      ? profileData[0]?.message
      : profileData?.message;
    throw new Error("Profile creation failed: " + (errMsg || "Unknown error"));
  }

  return { profileData, userID: userId };
}

export const fetchPetOwnerRecord = async (
  searchValue: string,
  locationFilter: string,
  entriesPerPage: number,
  currentPage: number
) => {
  const offset = (currentPage - 1) * entriesPerPage;

  try {
    let query = supabase
      .from("PetOwnerProfiles")
      .select(`*`, { count: "exact" });

    if (searchValue) {
      query = query.or(
        `first_name.ilike.%${searchValue}%,last_name.ilike.%${searchValue}%,gender.ilike.%${searchValue}%,barangay.ilike.%${searchValue}%`
      );
    }

    if (locationFilter) {
      query = query.eq("barangay", locationFilter);
    }

    const { data, error, status, count } = await query.range(
      offset,
      offset + entriesPerPage - 1
    );

    if (error) {
      throw error;
    }

    const petCounts = await supabase.rpc("get_pet_counts");

    if (petCounts.error) {
      // console.log("yow");
      throw petCounts.error;
    }

    return {
      data: data,
      petCounts: petCounts.data,
      count: count,
      status: status,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchPetOwnerRecordByFilter = async (
  date: string,
  location: string,
  entriesPerPage: number,
  currentPage: number
) => {
  const offset = (currentPage - 1) * entriesPerPage;

  try {
    let query = supabase
      .from("PetOwnerProfiles")
      .select(`*`, { count: "exact" });

    if (date) {
      query = query.eq("date_registered", date);
    }

    if (location) {
      query = query.eq("barangay", location);
    }

    const { data, error, status, count } = await query.range(
      offset,
      offset + entriesPerPage - 1
    );

    if (error) {
      throw error;
    }

    const petCounts = await supabase.rpc("get_pet_counts");

    if (petCounts.error) {
      throw petCounts.error;
    }

    return {
      data: data,
      petCounts: petCounts.data,
      count: count,
      status: status,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchPetOwnerByStringInput = async (name: string) => {
  try {
    let query = supabase.from("PetOwnerProfiles").select(`*`);

    if (name) {
      query = query.or(`first_name.ilike.%${name}%,last_name.ilike.%${name}%`);
    }
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchPetOwnerById = async (id: string) => {
  try {
    let query = supabase
      .from("PetOwnerProfiles")
      .select(`first_name, last_name`);

    if (id) {
      query = query.eq("id", id);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

// Edit a pet owner record (changes made here)
export const editPetOwnerRecord = async (
  id: string,
  updatedRecord: Partial<PetOwner>
) => {
  try {
    const { data, error } = await supabase
      .from("PetOwnerProfiles")
      .update(updatedRecord)
      .eq("id", id);

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error updating pet owner record:", error);
    return { data: null, error };
  }
};

// Delete a pet owner record
export const deletePetOwnerRecord = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("PetOwnerProfiles")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error deleting pet owner record:", error);
    return null;
  }
};
