import { NextRequest, NextResponse } from "next/server";
import { requireRole, isAuthError } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

// GET /api/vaccine-inventory?search=...&entriesPerPage=...&currentPage=...&all=true
export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "personnel"]);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all");

  // If all=true, fetch all records (for vaccination dropdown)
  if (all === "true") {
    try {
      const response = await supabase.from("VaccineInventory").select("*");
      if (response.error) throw response.error;
      return NextResponse.json(response);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const search = searchParams.get("search") || "";
  const entriesPerPage = parseInt(searchParams.get("entriesPerPage") || "10");
  const currentPage = parseInt(searchParams.get("currentPage") || "1");
  const offset = (currentPage - 1) * entriesPerPage;

  try {
    let query = supabase
      .from("VaccineInventory")
      .select("*")
      .order("last_modified", { ascending: false });

    if (search) {
      query = query.or(
        `batch_number.ilike.%${search}%,name.ilike.%${search}%,status.ilike.%${search}%`
      );
    }

    const response = await query.range(offset, offset + entriesPerPage - 1);
    if (response.error) throw response.error;

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/vaccine-inventory
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "personnel"]);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const body = await request.json();

  try {
    const response = await supabase
      .from("VaccineInventory")
      .insert(body)
      .select();

    if (response.error) throw response.error;
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
