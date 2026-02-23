import { supabase, supabaseAdmin } from "@/utils/supabase";
import { PetOwner } from "@/types/interfaces";

export const createPetOwnerUser = async (
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
      .from("PetOwnerProfiles")
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
