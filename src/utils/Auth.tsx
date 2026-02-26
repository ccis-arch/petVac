import { supabase } from "../utils/supabase";

export async function getUserAndRole(sessionToken: string) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(sessionToken);

  if (error) {
    console.error("Error fetching user:", error.message);
    return { user: null, role: null };
  }

  try {
    const response = await fetch("/api/admin/check-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id }),
    });

    const result = await response.json();

    if (result.role) {
      return { user, role: result.role };
    }
  } catch (err) {
    console.error("Error checking role:", err);
  }

  return { user, role: null };
}
