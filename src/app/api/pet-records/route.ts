import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole, isAuthError } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

// GET /api/pet-records
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("statusFilter") || "";
  const yearFilter = searchParams.get("yearFilter") || "";
  const monthFilter = searchParams.get("monthFilter") || "";
  const locationFilter = searchParams.get("locationFilter") || "";
  const entriesPerPage = parseInt(searchParams.get("entriesPerPage") || "10");
  const currentPage = parseInt(searchParams.get("currentPage") || "1");
  const offset = (currentPage - 1) * entriesPerPage;

  try {
    let query = supabase
      .from("ViewPetRecordsWithOwners")
      .select("*", { count: "exact" })
      .order("pet_name");

    if (search) {
      query = query.or(
        `pet_name.ilike.%${search}%,specie.ilike.%${search}%,sex.ilike.%${search}%,breed.ilike.%${search}%`
      );
    }

    if (statusFilter === "uved") {
      query = query.is("date_vaccinated", null);
    } else if (statusFilter === "ved") {
      query = query.not("date_vaccinated", "is", null);
    }

    if (monthFilter) {
      const year = new Date().getFullYear().toString();
      const startDate = new Date(`${year}-${monthFilter}-01`).toISOString();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      const endDateStr = endDate.toISOString();

      query = query
        .filter("date_vaccinated", "gte", startDate)
        .filter("date_vaccinated", "lt", endDateStr);
    }

    if (yearFilter) {
      query = query
        .filter("date_vaccinated", "gte", `${yearFilter}-01-01`)
        .filter("date_vaccinated", "lte", `${yearFilter}-12-31`);
    }

    if (locationFilter) {
      query = query.eq("owner_barangay", locationFilter);
    }

    let response;
    try {
      response = await query.range(offset, offset + entriesPerPage - 1);
    } catch (error: any) {
      if (error.code === "PGRST103") {
        return NextResponse.json({ data: [], count: 0, status: 200 });
      }
      throw error;
    }

    if (response.error) throw response.error;

    return NextResponse.json({
      data: response.data,
      count: response.count,
      status: response.status,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/pet-records
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "personnel"]);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const body = await request.json();

  try {
    const response = await supabase.from("PetRecords").insert(body);
    if (response.error) throw response.error;
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
