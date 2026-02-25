import { getAuthHeaders } from "@/utils/supabase";

export const fetchAppointmentRecordView = async (
  searchValue: string,
  entriesPerPage: number,
  currentPage: number
) => {
  try {
    const params = new URLSearchParams({
      type: "view",
      search: searchValue,
      entriesPerPage: entriesPerPage.toString(),
      currentPage: currentPage.toString(),
    });

    const res = await fetch(`/api/appointments?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch appointment records view");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchAppointmentRecord = async (
  vaccine_sched_id: any,
  time: any
) => {
  try {
    const params = new URLSearchParams({ type: "records" });
    if (vaccine_sched_id) params.set("vaccine_sched_id", vaccine_sched_id);
    if (time) params.set("time", time);

    const res = await fetch(`/api/appointments?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch appointment records");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchAppointmentRecordByOwnerID = async (ownerId: string) => {
  try {
    const params = new URLSearchParams({ type: "by-owner", ownerId });
    const res = await fetch(`/api/appointments?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch appointments by owner");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const checkerBeforeInsertion = async (
  owner_id: string,
  pet_id: string,
  vaccine_sched_id: any
) => {
  try {
    const params = new URLSearchParams({
      type: "check",
      owner_id,
      pet_id,
      vaccine_sched_id: vaccine_sched_id?.toString() || "",
    });

    const res = await fetch(`/api/appointments?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to check appointment");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const insertAppointmentRecord = async (data: any) => {
  try {
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to insert appointment record");
    return res.json();
  } catch (error) {
    console.error("Error inserting into table:", error);
    return null;
  }
};

export const updateAppointmentStatus = async (id: number, status: string) => {
  try {
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!res.ok) throw new Error("Failed to update appointment status");
    return res.json();
  } catch (error) {
    console.error("Error updating status:", error);
    return null;
  }
};

export const deleteAppointmentRecord = async (id: string) => {
  try {
    const res = await fetch(`/api/appointments/${id}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to delete appointment record");
    return res.json();
  } catch (error) {
    console.error("Error deleting data:", error);
    return null;
  }
};
