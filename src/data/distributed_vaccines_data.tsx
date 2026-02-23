import { supabase } from "@/utils/supabase";

export const fetchDistributionRecords = async () => {
  try {
    let query = supabase
      .from("DistributedVaccines")
      .select(`*`, { count: "exact" });

    const { data, error, status, count } = await query;

    if (error) {
      throw error;
    }

    const totalVaccines = data.reduce(
      (total, record) => total + record.num_vaccines,
      0
    );

    return {
      data: data,
      count: count,
      status: status,
      totalVaccines: totalVaccines,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchDistributionRecordsByBarangay = async (barangay: string) => {
  try {
    let query = supabase
      .from("DistributedVaccines")
      .select(`*`, { count: "exact" });

    if (barangay !== "") {
      query = query.eq("barangay", barangay);
    }

    const { data, error, status, count } = await query;

    if (error) {
      throw error;
    }

    const totalVaccines = data.reduce(
      (total, record) => total + record.num_vaccines,
      0
    );

    return {
      data: data,
      count: count,
      status: status,
      totalVaccines: totalVaccines,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const insertDistributedVaccines = async (data: any) => {
  try {
    const response = await supabase.from("DistributedVaccines").insert(data);
    if (response.error) {
      throw response.error;
    }
    return response;
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
    const { data, error } = await supabase
      .from("DistributedVaccines")
      .update(updateData)
      .eq("inventory_id", id);

    if (error) {
      throw error;
    }

    return data;
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
    const { data, error } = await supabase
      .from("DistributedVaccines")
      .update(updateData)
      .eq("barangay", barangay)
      .eq("date", date)
      .eq("inventory_id", inventory_id);

    if (error) {
      throw error;
    }

    return data;
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
    const { data, error } = await supabase
      .from("DistributedVaccines")
      .update(updateData)
      .eq("inventory_id", inventory_id);

    if (error) {
      throw error;
    }

    return data;
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
    const { data, error } = await supabase
      .from("DistributedVaccines")
      .select("id, num_vaccines")
      .eq("barangay", barangay)
      .eq("date", date)
      .eq("inventory_id", inventory_id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching pet record:", error);
    return null;
  }
};
