import { supabase } from "@/utils/supabase";

export const fetchPetRecord = async (
  searchValue: string,
  statusFilter: string,
  yearFilter: string,
  monthFilter: string,
  locationFilter: string,
  entriesPerPage: number,
  currentPage: number
) => {
  const offset = (currentPage - 1) * entriesPerPage;

  try {
    let query = supabase
      .from("ViewPetRecordsWithOwners")
      .select(`*`, { count: "exact" })
      .order("pet_name");

    if (searchValue) {
      query = query.or(
        `pet_name.ilike.%${searchValue}%,specie.ilike.%${searchValue}%,sex.ilike.%${searchValue}%,breed.ilike.%${searchValue}%`
      );
    }

    if (statusFilter === "uved") {
      query = query.is("date_vaccinated", null);
    } else if (statusFilter === "ved") {
      query = query.not("date_vaccinated", "is", null);
    }

    if (monthFilter) {
      const year = new Date().getFullYear().toString();
      const startDate = new Date(`${year}-${monthFilter}-01`).toISOString();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      const endDateStr = endDate.toISOString();

      query = query
        .filter("date_vaccinated", "gte", startDate)
        .filter("date_vaccinated", "lt", endDateStr);
    }

    if (yearFilter) {
      query = query
        .filter("date_vaccinated", "gte", `${yearFilter}-01-01`)
        .filter("date_vaccinated", "lte", `${yearFilter}-12-31`);
    }

    if (locationFilter) {
      query = query.eq("owner_barangay", locationFilter);
    }

    let response;
    try {
      response = await query.range(offset, offset + entriesPerPage - 1);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "PGRST103"
      ) {
        console.warn("Requested range not satisfiable, returning empty array.");
        return [];
      } else {
        throw error;
      }
    }

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchPetRecordByOwnerID = async (ownerId: string) => {
  try {
    const { data, error } = await supabase
      .from("PetRecords")
      .select("*")
      .eq("owner_id", ownerId)
      .order("birth_date", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchPetRecordForVaccination = async (vaccineSchedId: any) => {
  // console.log("vaccineSchedId", vaccineSchedId);
  try {
    let query = supabase
      .from("ViewPetRecordsForVaccination")
      .select("*")
      .eq("vaccine_sched_id", vaccineSchedId)
      .eq("status", "uved");
    // .is("date_vaccinated", null);

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

export const insertPetRecord = async (data: any) => {
  try {
    const response = await supabase.from("PetRecords").insert(data);

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error inserting into table:", error);
    return null;
  }
};

// Edit a pet record
export const editPetRecord = async (id: string, updatedRecord: any) => {
  try {
    const { data, error } = await supabase
      .from("PetRecords")
      .update(updatedRecord)
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

// Delete a pet record
export const deletePetRecord = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("PetRecords")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error deleting pet record:", error);
    return null;
  }
};
