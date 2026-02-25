import { getAuthHeaders } from "@/utils/supabase";

export const fetchCompleteVaccinationDetailsData = async (
  searchValue: string,
  entriesPerPage: number,
  currentPage: number
) => {
  try {
    const params = new URLSearchParams({
      type: "details",
      search: searchValue,
      entriesPerPage: entriesPerPage.toString(),
      currentPage: currentPage.toString(),
    });

    const res = await fetch(`/api/vaccination-records?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok)
      throw new Error("Failed to fetch complete vaccination details");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
