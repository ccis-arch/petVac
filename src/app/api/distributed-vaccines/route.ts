import { NextRequest, NextResponse } from "next/server";
import { requireRole, isAuthError } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

// GET /api/distributed-vaccines?barangay=...
export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "personnel"]);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const barangay = searchParams.get("barangay") || "";
  const type = searchParams.get("type") || "all";

  try {
    // checkIfDataExists
    if (type === "check") {
      const date = searchParams.get("date") || "";
      const inventory_id = parseInt(searchParams.get("inventory_id") || "0");

      const { data, error } = await supabase
        .from("DistributedVaccines")
        .select("id, num_vaccines")
        .eq("barangay", barangay)
        .eq("date", date)
        .eq("inventory_id", inventory_id);

      if (error) throw error;
      return NextResponse.json(data);
    }

    // fetchDistributionRecordsByBarangay or fetchDistributionRecords
    let query = supabase
      .from("DistributedVaccines")
      .select("*", { count: "exact" });

    if (barangay !== "") {
      query = query.eq("barangay", barangay);
    }

    const { data, error, status, count } = await query;
    if (error) throw error;

    const totalVaccines = (data || []).reduce(
      (total: number, record: any) => total + record.num_vaccines,
      0
    );

    return NextResponse.json({ data, count, status, totalVaccines });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/distributed-vaccines
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "personnel"]);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const body = await request.json();

  try {
    const response = await supabase.from("DistributedVaccines").insert(body);
    if (response.error) throw response.error;
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/distributed-vaccines
export async function PATCH(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "personnel"]);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const body = await request.json();
  const { type, id, barangay, date, inventory_id, updateData } = body;

  try {
    if (type === "by-inventory") {
      const { data, error } = await supabase
        .from("DistributedVaccines")
        .update(updateData)
        .eq("inventory_id", id);

      if (error) throw error;
      return NextResponse.json(data);
    }

    if (type === "by-date-barangay") {
      const { data, error } = await supabase
        .from("DistributedVaccines")
        .update(updateData)
        .eq("barangay", barangay)
        .eq("date", date)
        .eq("inventory_id", inventory_id);

      if (error) throw error;
      return NextResponse.json(data);
    }

    if (type === "by-inventory-id") {
      const { data, error } = await supabase
        .from("DistributedVaccines")
        .update(updateData)
        .eq("inventory_id", inventory_id);

      if (error) throw error;
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
