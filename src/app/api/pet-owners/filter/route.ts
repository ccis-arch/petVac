import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

// GET /api/pet-owners/filter?date=...&location=...&entriesPerPage=...&currentPage=...
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || "";
  const location = searchParams.get("location") || "";
  const entriesPerPage = parseInt(searchParams.get("entriesPerPage") || "10");
  const currentPage = parseInt(searchParams.get("currentPage") || "1");
  const offset = (currentPage - 1) * entriesPerPage;

  try {
    let query = supabase
      .from("PetOwnerProfiles")
      .select("*", { count: "exact" });

    if (date) {
      query = query.eq("date_registered", date);
    }

    if (location) {
      query = query.eq("barangay", location);
    }

    const { data, error, status, count } = await query.range(
      offset,
      offset + entriesPerPage - 1
    );

    if (error) throw error;

    const petCounts = await supabase.rpc("get_pet_counts");
    if (petCounts.error) throw petCounts.error;

    return NextResponse.json({
      data,
      petCounts: petCounts.data,
      count,
      status,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
