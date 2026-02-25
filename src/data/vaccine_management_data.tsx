import { getAuthHeaders } from "@/utils/supabase";

export const fetchVMSRecord = async (
  searchValue: string,
  entriesPerPage: number,
  currentPage: number
) => {
  try {
    const params = new URLSearchParams({
      search: searchValue,
      entriesPerPage: entriesPerPage.toString(),
      currentPage: currentPage.toString(),
    });

    const res = await fetch(`/api/vaccine-inventory?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch VMS records");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchVMSRecordForVaccination = async () => {
  try {
    const res = await fetch(`/api/vaccine-inventory?all=true`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch VMS records for vaccination");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const insertVMSRecord = async (data: any) => {
  try {
    const res = await fetch("/api/vaccine-inventory", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to insert VMS record");
    return res.json();
  } catch (error) {
    console.error("Error inserting into table:", error);
    return null;
  }
};

export const editVMSRecord = async (id: string, updatedRecord: any) => {
  try {
    const res = await fetch(`/api/vaccine-inventory/${id}`, {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify(updatedRecord),
    });

    if (!res.ok) throw new Error("Failed to update VMS record");
    return res.json();
  } catch (error) {
    console.error("Error updating VMS record:", error);
    return null;
  }
};

export const deleteVMSRecord = async (id: string) => {
  try {
    const res = await fetch(`/api/vaccine-inventory/${id}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to delete VMS record");
    return res.json();
  } catch (error) {
    console.error("Error deleting data:", error);
    return null;
  }
};

export const updateVaccineInventoryWithInventoryID = async (
  id: number,
  updateData: any
) => {
  try {
    const res = await fetch(`/api/vaccine-inventory/${id}`, {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    if (!res.ok) throw new Error("Failed to update vaccine inventory");
    return res.json();
  } catch (error) {
    console.error("Error updating pet record:", error);
    return null;
  }
};
