import { getAuthHeaders } from "@/utils/supabase";

export const fetchPetRecord = async (
  searchValue: string,
  statusFilter: string,
  yearFilter: string,
  monthFilter: string,
  locationFilter: string,
  entriesPerPage: number,
  currentPage: number
) => {
  try {
    const params = new URLSearchParams({
      search: searchValue,
      statusFilter,
      yearFilter,
      monthFilter,
      locationFilter,
      entriesPerPage: entriesPerPage.toString(),
      currentPage: currentPage.toString(),
    });

    const res = await fetch(`/api/pet-records?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch pet records");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchPetRecordByOwnerID = async (ownerId: string) => {
  try {
    const res = await fetch(`/api/pet-records/by-owner/${ownerId}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch pet records by owner");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchPetRecordForVaccination = async (vaccineSchedId: any) => {
  try {
    const params = new URLSearchParams({
      vaccineSchedId: vaccineSchedId.toString(),
    });

    const res = await fetch(`/api/pet-records/for-vaccination?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch pet records for vaccination");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const insertPetRecord = async (data: any) => {
  try {
    const res = await fetch("/api/pet-records", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to insert pet record");
    return res.json();
  } catch (error) {
    console.error("Error inserting into table:", error);
    return null;
  }
};

export const editPetRecord = async (id: string, updatedRecord: any) => {
  try {
    const res = await fetch(`/api/pet-records/${id}`, {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify(updatedRecord),
    });

    if (!res.ok) throw new Error("Failed to update pet record");
    return res.json();
  } catch (error) {
    console.error("Error updating pet record:", error);
    return null;
  }
};

export const deletePetRecord = async (id: string) => {
  try {
    const res = await fetch(`/api/pet-records/${id}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to delete pet record");
    return res.json();
  } catch (error) {
    console.error("Error deleting pet record:", error);
    return null;
  }
};
