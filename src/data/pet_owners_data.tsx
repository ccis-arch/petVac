import { getAuthHeaders } from "@/utils/supabase";
import { PetOwner } from "@/types/interfaces";

export const createPetOwnerUser = async (
  email: string,
  password: string,
  profile: any
) => {
  const res = await fetch("/api/pet-owners", {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ email, password, profile }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create pet owner user");
  }

  return res.json();
};

export const fetchPetOwnerRecord = async (
  searchValue: string,
  locationFilter: string,
  entriesPerPage: number,
  currentPage: number
) => {
  try {
    const params = new URLSearchParams({
      search: searchValue,
      location: locationFilter,
      entriesPerPage: entriesPerPage.toString(),
      currentPage: currentPage.toString(),
    });

    const res = await fetch(`/api/pet-owners?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch pet owners");
    return res.json();
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
  try {
    const params = new URLSearchParams({
      date,
      location,
      entriesPerPage: entriesPerPage.toString(),
      currentPage: currentPage.toString(),
    });

    const res = await fetch(`/api/pet-owners/filter?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch pet owners by filter");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchPetOwnerByStringInput = async (name: string) => {
  try {
    const params = new URLSearchParams({ name });
    const res = await fetch(`/api/pet-owners/search?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to search pet owners");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchPetOwnerById = async (id: string) => {
  try {
    const res = await fetch(`/api/pet-owners/${id}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch pet owner by id");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const editPetOwnerRecord = async (
  id: string,
  updatedRecord: Partial<PetOwner>
) => {
  try {
    const res = await fetch(`/api/pet-owners/${id}`, {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify(updatedRecord),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update pet owner");
    }

    return await res.json();
  } catch (error) {
    console.error("Error updating pet owner record:", error);
    return { data: null, error };
  }
};

export const deletePetOwnerRecord = async (id: string) => {
  try {
    const res = await fetch(`/api/pet-owners/${id}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to delete pet owner");
    return res.json();
  } catch (error) {
    console.error("Error deleting pet owner record:", error);
    return null;
  }
};
