import { NextRequest, NextResponse } from "next/server";
import { requireRole, isAuthError } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

// GET /api/pet-records/for-vaccination?vaccineSchedId=...
export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "personnel"]);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const vaccineSchedId = searchParams.get("vaccineSchedId");

  try {
    let query = supabase
      .from("ViewPetRecordsForVaccination")
      .select("*")
      .eq("vaccine_sched_id", vaccineSchedId)
      .eq("status", "uved");

    const response = await query;
    if (response.error) throw response.error;

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
