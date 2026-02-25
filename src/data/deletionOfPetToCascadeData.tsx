import { getAuthHeaders } from "@/utils/supabase";

export const checkIfVaccinationRecordHavePetID = async (pet_id: string) => {
  try {
    const params = new URLSearchParams({
      type: "vaccination-pet",
      pet_id,
    });

    const res = await fetch(`/api/cascade-checks?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to check vaccination records");
    return res.json();
  } catch (error) {
    console.error("Error fetching pet record:", error);
    return null;
  }
};

export const checkIfDistributedVaccinatHaveInvetoryIdOfVaccinatedPet = async (
  inventory_id: number
) => {
  try {
    const params = new URLSearchParams({
      type: "distributed-inventory",
      inventory_id: inventory_id.toString(),
    });

    const res = await fetch(`/api/cascade-checks?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to check distributed vaccines");
    return res.json();
  } catch (error) {
    console.error("Error fetching pet record:", error);
    return null;
  }
};

export const checkVaccineIdInVaccineInventory = async (
  inventory_id: number
) => {
  try {
    const params = new URLSearchParams({
      type: "vaccine-inventory",
      inventory_id: inventory_id.toString(),
    });

    const res = await fetch(`/api/cascade-checks?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to check vaccine inventory");
    return res.json();
  } catch (error) {
    console.error("Error fetching pet record:", error);
    return null;
  }
};
