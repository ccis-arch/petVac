import { supabase } from "@/utils/supabase";

export const checkIfVaccinationRecordHavePetID = async (pet_id: string) => {
  try {
    const { data, error } = await supabase
      .from("VaccinationRecords")
      .select("vaccine_id")
      .eq("pet_id", pet_id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching pet record:", error);
    return null;
  }
};

export const checkIfDistributedVaccinatHaveInvetoryIdOfVaccinatedPet = async (
  inventory_id: number
) => {
  try {
    const { data, error } = await supabase
      .from("DistributedVaccines")
      .select("id, num_vaccines")
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

export const checkVaccineIdInVaccineInventory = async (
  inventory_id: number
) => {
  try {
    const { data, error } = await supabase
      .from("VaccineInventory")
      .select("id, remaining_qty")
      .eq("id", inventory_id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching pet record:", error);
    return null;
  }
};
