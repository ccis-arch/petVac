import { supabase, supabaseAdmin } from "@/utils/supabase";

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

export const insertAdminNotification = async (data: any) => {
  try {
    const response = await supabaseAdmin.from("AdminNotifications").insert(data);
    if (response.error) {
      throw response.error;
    }
    return response;
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
      .match({});

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error deleting all data:", error);
    return null;
  }
};
