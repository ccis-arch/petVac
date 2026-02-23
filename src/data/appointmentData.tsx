import { supabase } from "@/utils/supabase";

export const fetchAppointmentRecordView = async (
  searchValue: string,
  entriesPerPage: number,
  currentPage: number
) => {
  const offset = (currentPage - 1) * entriesPerPage;

  try {
    let query = supabase
      .from("ViewCompleteAppointmentDetails")
      .select(`*`, { count: "exact" })
      .order("ticket_num", { ascending: true });

    if (searchValue) {
      query = query.or(`ticket_num.ilike.%${searchValue}%`);
    }

    const response = await query.range(offset, offset + entriesPerPage - 1);

    if (response.error) {
      throw response.error;
    }
    return response;
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
    let query = supabase.from("AppointmentRecords").select("*");

    if (vaccine_sched_id) {
      query = query.eq("vaccine_sched_id", vaccine_sched_id);
    }
    if (time) {
      query = query.eq("time", time);
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

export const fetchAppointmentRecordByOwnerID = async (ownerId: string) => {
  try {
    const { data, error } = await supabase
      .from("ViewCompleteAppointmentDetails")
      .select()
      .eq("owner_id", ownerId);

    if (error) {
      throw error;
    }

    return data;
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
    let query = supabase
      .from("AppointmentRecords")
      .select("id")
      .eq("vaccine_sched_id", vaccine_sched_id)
      .eq("owner_id", owner_id)
      .eq("pet_id", pet_id);

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

export const insertAppointmentRecord = async (data: any) => {
  try {
    const response = await supabase.from("AppointmentRecords").insert(data);
    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error inserting into table:", error);
    return null;
  }
};

export const updateAppointmentStatus = async (id: number, status: string) => {
  try {
    const response = await supabase
      .from("AppointmentRecords")
      .update({ status })
      .eq("id", id);

    if (response.error) {
      throw response.error;
    }

    return response;
  } catch (error) {
    console.error("Error updating status:", error);
    return null;
  }
};

export const deleteAppointmentRecord = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("AppointmentRecords")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error deleting data:", error);
    return null;
  }
};
