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
    // Use REST API with service key to bypass RLS (called during registration before full auth)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || "";

    if (serviceKey) {
      const res = await fetch(`${supabaseUrl}/rest/v1/AdminNotifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify(notifData),
      });
      const result = await res.json();
      return { data: result, status: res.status };
    }

    // Fallback to supabase client
    const { data, error, status } = await supabase
      .from("AdminNotifications")
      .insert(notifData);

    if (error) {
      throw error;
    }

    return { data, status };
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
