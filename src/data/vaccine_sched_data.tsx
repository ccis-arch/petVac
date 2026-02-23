import { supabase } from "@/utils/supabase";

export const fetchVaccineSchedule = async (selectedLocation: string) => {
  try {
    let query = supabase.from("VaccinationSchedule").select("*");

    if (selectedLocation) {
      query = query.eq("location", selectedLocation);
    }

    const response = await query;
    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchVaccineScheduleForAppointment = async (
  selectedLocation: string
) => {
  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    let query = supabase
      .from("VaccinationSchedule")
      .select("*")
      .gte("start_date", currentDate.toISOString().split("T")[0]); // Only select records where start_date is greater than or equal to the current date

    if (selectedLocation) {
      query = query.eq("location", selectedLocation);
    }

    const response = await query.order("start_date", { ascending: true });
    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const insertVaccineSchedule = async (data: any) => {
  try {
    const response = await supabase.from("VaccinationSchedule").insert(data);
    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error inserting into table:", error);
    return null;
  }
};

export const updateVaccineSchedule = async (id: number, updatedSched: any) => {
  try {
    const { data, error } = await supabase
      .from("VaccinationSchedule")
      .update(updatedSched)
      .eq("id", id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating pet record:", error);
    return null;
  }
};

export const deleteVaccineSchedule = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from("VaccinationSchedule")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error deleting vaccine schedule record:", error);
    return null;
  }
};
