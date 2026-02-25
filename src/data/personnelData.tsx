import { getAuthHeaders } from "@/utils/supabase";

export const createPersonnelUser = async (
  email: string,
  password: string,
  profile: any
) => {
  const res = await fetch("/api/personnel", {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ email, password, profile }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create personnel user");
  }

  return res.json();
};

export const fetchPersonnelUserRecord = async (
  searchValue: string,
  entriesPerPage: number,
  currentPage: number
) => {
  try {
    const params = new URLSearchParams({
      search: searchValue,
      entriesPerPage: entriesPerPage.toString(),
      currentPage: currentPage.toString(),
    });

    const res = await fetch(`/api/personnel?${params}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch personnel records");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const editPersonnelUserRecord = async (
  id: string,
  updatedRecord: { email: string; password: string }
) => {
  const res = await fetch(`/api/personnel/${id}`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify(updatedRecord),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update personnel user");
  }

  return res.json();
};

export const deletePersonnelUserRecord = async (id: string) => {
  try {
    const res = await fetch(`/api/personnel/${id}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to delete personnel user");
    return res.json();
  } catch (error) {
    console.error("Error deleting user:", error);
    return null;
  }
};
