import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole, isAuthError } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

// GET /api/vaccination-schedule?location=...&forAppointment=true
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const selectedLocation = searchParams.get("location") || "";
  const forAppointment = searchParams.get("forAppointment") === "true";

  try {
    if (forAppointment) {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      let query = supabase
        .from("VaccinationSchedule")
        .select("*")
        .gte("start_date", currentDate.toISOString().split("T")[0]);

      if (selectedLocation) {
        query = query.eq("location", selectedLocation);
      }

      const response = await query.order("start_date", { ascending: true });
      if (response.error) throw response.error;
      return NextResponse.json(response);
    }

    let query = supabase.from("VaccinationSchedule").select("*");

    if (selectedLocation) {
      query = query.eq("location", selectedLocation);
    }

    const response = await query;
    if (response.error) throw response.error;
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/vaccination-schedule
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "personnel"]);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const body = await request.json();

  try {
    const response = await supabase.from("VaccinationSchedule").insert(body);
    if (response.error) throw response.error;
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
