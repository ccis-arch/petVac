import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole, isAuthError } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

// GET /api/appointments?type=view|records|by-owner
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "view";

  try {
    // fetchAppointmentRecordView
    if (type === "view") {
      const search = searchParams.get("search") || "";
      const entriesPerPage = parseInt(searchParams.get("entriesPerPage") || "10");
      const currentPage = parseInt(searchParams.get("currentPage") || "1");
      const offset = (currentPage - 1) * entriesPerPage;

      let query = supabase
        .from("ViewCompleteAppointmentDetails")
        .select("*", { count: "exact" })
        .order("ticket_num", { ascending: true });

      if (search) {
        query = query.or(`ticket_num.ilike.%${search}%`);
      }

      const response = await query.range(offset, offset + entriesPerPage - 1);
      if (response.error) throw response.error;
      return NextResponse.json(response);
    }

    // fetchAppointmentRecord
    if (type === "records") {
      const vaccine_sched_id = searchParams.get("vaccine_sched_id");
      const time = searchParams.get("time");

      let query = supabase.from("AppointmentRecords").select("*");

      if (vaccine_sched_id) {
        query = query.eq("vaccine_sched_id", vaccine_sched_id);
      }
      if (time) {
        query = query.eq("time", time);
      }

      const response = await query;
      if (response.error) throw response.error;
      return NextResponse.json(response);
    }

    // fetchAppointmentRecordByOwnerID
    if (type === "by-owner") {
      const ownerId = searchParams.get("ownerId") || "";

      const { data, error } = await supabase
        .from("ViewCompleteAppointmentDetails")
        .select()
        .eq("owner_id", ownerId);

      if (error) throw error;
      return NextResponse.json(data);
    }

    // checkerBeforeInsertion
    if (type === "check") {
      const owner_id = searchParams.get("owner_id") || "";
      const pet_id = searchParams.get("pet_id") || "";
      const vaccine_sched_id = searchParams.get("vaccine_sched_id");

      const response = await supabase
        .from("AppointmentRecords")
        .select("id")
        .eq("vaccine_sched_id", vaccine_sched_id)
        .eq("owner_id", owner_id)
        .eq("pet_id", pet_id);

      if (response.error) throw response.error;
      return NextResponse.json(response);
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/appointments
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const body = await request.json();

  try {
    const response = await supabase.from("AppointmentRecords").insert(body);
    if (response.error) throw response.error;
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
