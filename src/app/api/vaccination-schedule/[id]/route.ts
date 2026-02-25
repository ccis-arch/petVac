import { NextRequest, NextResponse } from "next/server";
import { requireRole, isAuthError } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

// PATCH /api/vaccination-schedule/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(request, ["admin", "personnel"]);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;
  const supabase = createServerSupabase();
  const body = await request.json();

  try {
    const { data, error } = await supabase
      .from("VaccinationSchedule")
      .update(body)
      .eq("id", parseInt(id));

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/vaccination-schedule/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(request, ["admin", "personnel"]);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;
  const supabase = createServerSupabase();

  try {
    const { data, error } = await supabase
      .from("VaccinationSchedule")
      .delete()
      .eq("id", parseInt(id));

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
