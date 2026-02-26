import { supabase } from "@/utils/supabase";

export const getAdminNotifications = async () => {
  try {
    const { data, error } = await supabase
      .from("AdminNotifications")
      .select()
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return { data, error };
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const insertAdminNotification = async (notifData: any) => {
  try {
    const response = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notifData),
    });

    const result = await response.json();
    return { data: result.data, status: response.status };
  } catch (error) {
    console.error("Error inserting into table:", error);
    return null;
  }
};

export const deleteAdminNotification = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("AdminNotifications")
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

export const deleteAllAdminNotifications = async () => {
  try {
    const { data, error } = await supabase
      .from("AdminNotifications")
      .delete()
      .gte("id", 0);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error deleting all data:", error);
    return null;
  }
};
