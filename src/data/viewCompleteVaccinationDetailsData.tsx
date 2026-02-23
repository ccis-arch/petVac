import { supabase } from "@/utils/supabase";

// export const fetchCompleteVaccinationDetailsData = async () => {
//   try {
//     const { data, error } = await supabase
//       .from("ViewCompleteVaccinationDetails")
//       .select()
//       .order("created_at", { ascending: false });

//     if (error) {
//       throw error;
//     }

//     return { data, error };
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     return null;
//   }
// };

export const fetchCompleteVaccinationDetailsData = async (
  searchValue: string,
  entriesPerPage: number,
  currentPage: number
) => {
  const offset = (currentPage - 1) * entriesPerPage;

  try {
    let query = supabase
      .from("ViewCompleteVaccinationDetails")
      .select("*")
      .order("created_at", { ascending: false });

    if (searchValue) {
      query = query.or(
        `location.ilike.%${searchValue}%,vaccine_name.ilike.%${searchValue}%,pet_owner.ilike.%${searchValue}%,pet_name.ilike.%${searchValue}%`
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
