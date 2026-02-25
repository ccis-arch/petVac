import { getAuthHeaders } from "@/utils/supabase";

export const fetchVaccineSchedule = async (selectedLocation: string) => {
  try {
    const params = new URLSearchParams({ location: selectedLocation });
    const res = await fetch(`/api/vaccination-schedule?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch vaccine schedule");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchVaccineScheduleForAppointment = async (
  selectedLocation: string
) => {
  try {
    const params = new URLSearchParams({
      location: selectedLocation,
      forAppointment: "true",
    });

    const res = await fetch(`/api/vaccination-schedule?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch vaccine schedule for appointment");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const insertVaccineSchedule = async (data: any) => {
  try {
    const res = await fetch("/api/vaccination-schedule", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to insert vaccine schedule");
    return res.json();
  } catch (error) {
    console.error("Error inserting into table:", error);
    return null;
  }
};

export const updateVaccineSchedule = async (id: number, updatedSched: any) => {
  try {
    const res = await fetch(`/api/vaccination-schedule/${id}`, {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify(updatedSched),
    });

    if (!res.ok) throw new Error("Failed to update vaccine schedule");
    return res.json();
  } catch (error) {
    console.error("Error updating pet record:", error);
    return null;
  }
};

export const deleteVaccineSchedule = async (id: number) => {
  try {
    const res = await fetch(`/api/vaccination-schedule/${id}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to delete vaccine schedule");
    return res.json();
  } catch (error) {
    console.error("Error deleting vaccine schedule record:", error);
    return null;
  }
};
