import { getAuthHeaders } from "@/utils/supabase";

export const getAdminNotifications = async () => {
  try {
    const res = await fetch("/api/notifications", {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch notifications");
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const insertAdminNotification = async (data: any) => {
  try {
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to insert notification");
    return res.json();
  } catch (error) {
    console.error("Error inserting into table:", error);
    return null;
  }
};

export const deleteAdminNotification = async (id: string) => {
  try {
    const res = await fetch(`/api/notifications?id=${id}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to delete notification");
    return res.json();
  } catch (error) {
    console.error("Error deleting data:", error);
    return null;
  }
};

export const deleteAllAdminNotifications = async () => {
  try {
    const res = await fetch("/api/notifications", {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to delete all notifications");
    return res.json();
  } catch (error) {
    console.error("Error deleting all data:", error);
    return null;
  }
};
