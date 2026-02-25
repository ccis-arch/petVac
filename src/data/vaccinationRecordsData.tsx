import { getAuthHeaders } from "@/utils/supabase";

export const fetchVaccinatedPets = async (barangay: string) => {
  try {
    const params = new URLSearchParams({ type: "stats", barangay });
    const res = await fetch(`/api/vaccination-records?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch vaccinated pets");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return;
  }
};

export const fetchVaccinatedPetsByBarangay = async () => {
  try {
    const res = await fetch(
      `/api/vaccination-records?type=by-barangay-totals`,
      { headers: await getAuthHeaders() }
    );

    if (!res.ok) throw new Error("Failed to fetch vaccinated pets by barangay");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return;
  }
};

export const fetchVaccinatedPetsAllBarangay = async () => {
  try {
    const res = await fetch(`/api/vaccination-records?type=all-count`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch all vaccinated pets");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchVaccinationRecordsEachBarangay = async (date: string) => {
  try {
    const params = new URLSearchParams({ type: "each-barangay", date });
    const res = await fetch(`/api/vaccination-records?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok)
      throw new Error("Failed to fetch vaccination records each barangay");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchVaccinationRecordsEachBarangayMoreDetails = async (
  date: string
) => {
  try {
    const params = new URLSearchParams({
      type: "each-barangay-details",
      date,
    });
    const res = await fetch(`/api/vaccination-records?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok)
      throw new Error("Failed to fetch vaccination records details");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchVaccinationRecordsByOwnerID = async (ownerId: string) => {
  try {
    const params = new URLSearchParams({ type: "by-owner", ownerId });
    const res = await fetch(`/api/vaccination-records?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok)
      throw new Error("Failed to fetch vaccination records by owner");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const insertVaccinationRecord = async (data: any) => {
  try {
    const res = await fetch("/api/vaccination-records", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to insert vaccination record");
    return res.json();
  } catch (error) {
    console.error("Error inserting into table:", error);
    return null;
  }
};
