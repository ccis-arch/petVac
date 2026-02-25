import { supabase, getAuthHeaders } from "../utils/supabase";

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
    const res = await fetch("/api/auth/role", {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return { user, role: null };
    }

    const data = await res.json();
    return { user, role: data.role };
  } catch (err) {
    console.error("Error fetching role:", err);
    return { user, role: null };
  }
}
