import { getAuthHeaders } from "@/utils/supabase";

export const fetchPetOwnerRegistered = async (barangay: string) => {
  try {
    const params = new URLSearchParams({ type: "count", barangay });
    const res = await fetch(`/api/overview?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch registered pet owners");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return;
  }
};

export const fetchPetOwnersRegisteredAllBarangay = async () => {
  try {
    const res = await fetch(`/api/overview?type=all`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok)
      throw new Error("Failed to fetch registered pet owners all barangay");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
