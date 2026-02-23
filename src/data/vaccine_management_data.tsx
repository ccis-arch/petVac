import { supabase } from "@/utils/supabase";

export const fetchVMSRecord = async (
  searchValue: string,
  entriesPerPage: number,
  currentPage: number
) => {
  const offset = (currentPage - 1) * entriesPerPage;

  try {
    let query = supabase
      .from("VaccineInventory")
      .select("*")
      .order("last_modified", { ascending: false });

    if (searchValue) {
      query = query.or(
        `batch_number.ilike.%${searchValue}%,name.ilike.%${searchValue}%,status.ilike.%${searchValue}%`
      );
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

export const fetchVMSRecordForVaccination = async () => {
  try {
    let query = supabase.from("VaccineInventory").select("*");

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

export const insertVMSRecord = async (data: any) => {
  try {
    const response = await supabase
      .from("VaccineInventory")
      .insert(data)
      .select();

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error inserting into table:", error);
    return null;
  }
};

export const editVMSRecord = async (id: string, updatedRecord: any) => {
  try {
    const { data, error } = await supabase
      .from("VaccineInventory")
      .update(updatedRecord)
      .eq("id", id)
      .select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating VMS record:", error);
    return null;
  }
};

export const deleteVMSRecord = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("VaccineInventory")
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

export const updateVaccineInventoryWithInventoryID = async (
  id: number,
  updateData: any
) => {
  try {
    const { data, error } = await supabase
      .from("VaccineInventory")
      .update(updateData)
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
