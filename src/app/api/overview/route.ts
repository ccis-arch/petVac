import { NextRequest, NextResponse } from "next/server";
import { requireRole, isAuthError } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

// GET /api/overview?barangay=...&type=count|all
export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "personnel"]);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "count";
  const barangay = searchParams.get("barangay") || "";

  try {
    if (type === "count") {
      let query = supabase
        .from("PetOwnerProfiles")
        .select("*", { count: "exact" });

      if (barangay !== "") {
        query = query.eq("barangay", barangay);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return NextResponse.json(count);
    }

    if (type === "all") {
      const { data, error, status, count } = await supabase
        .from("PetOwnerProfiles")
        .select("*", { count: "exact" });

      if (error) throw error;
      return NextResponse.json({ data, count, status });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
