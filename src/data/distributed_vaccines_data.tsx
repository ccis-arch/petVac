import { getAuthHeaders } from "@/utils/supabase";

export const fetchDistributionRecords = async () => {
  try {
    const res = await fetch(`/api/distributed-vaccines`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch distribution records");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchDistributionRecordsByBarangay = async (barangay: string) => {
  try {
    const params = new URLSearchParams({ barangay });
    const res = await fetch(`/api/distributed-vaccines?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok)
      throw new Error("Failed to fetch distribution records by barangay");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const insertDistributedVaccines = async (data: any) => {
  try {
    const res = await fetch("/api/distributed-vaccines", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to insert distributed vaccines");
    return res.json();
  } catch (error) {
    console.error("Error inserting into table:", error);
    return null;
  }
};

export const updateDistributedVaccines = async (
  id: number,
  updateData: any
) => {
  try {
    const res = await fetch("/api/distributed-vaccines", {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ type: "by-inventory", id, updateData }),
    });

    if (!res.ok) throw new Error("Failed to update distributed vaccines");
    return res.json();
  } catch (error) {
    console.error("Error updating pet record:", error);
    return null;
  }
};

export const updateDistributedVaccineWithDateAndBarangay = async (
  barangay: string,
  date: string,
  inventory_id: number,
  updateData: any
) => {
  try {
    const res = await fetch("/api/distributed-vaccines", {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        type: "by-date-barangay",
        barangay,
        date,
        inventory_id,
        updateData,
      }),
    });

    if (!res.ok) throw new Error("Failed to update distributed vaccine");
    return res.json();
  } catch (error) {
    console.error("Error updating pet record:", error);
    return null;
  }
};

export const updateDistributedVaccineWithInventoryID = async (
  inventory_id: number,
  updateData: any
) => {
  try {
    const res = await fetch("/api/distributed-vaccines", {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        type: "by-inventory-id",
        inventory_id,
        updateData,
      }),
    });

    if (!res.ok)
      throw new Error("Failed to update distributed vaccine by inventory ID");
    return res.json();
  } catch (error) {
    console.error("Error updating pet record:", error);
    return null;
  }
};

export const checkIfDataExists = async (
  barangay: string,
  date: string,
  inventory_id: number
) => {
  try {
    const params = new URLSearchParams({
      type: "check",
      barangay,
      date,
      inventory_id: inventory_id.toString(),
    });

    const res = await fetch(`/api/distributed-vaccines?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to check if data exists");
    return res.json();
  } catch (error) {
    console.error("Error fetching pet record:", error);
    return null;
  }
};
