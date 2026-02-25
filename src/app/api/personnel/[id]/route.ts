import { NextRequest, NextResponse } from "next/server";
import { requireRole, isAuthError } from "@/lib/auth";
import { createServerSupabase, createServerSupabaseAdmin } from "@/lib/supabase-server";

// PATCH /api/personnel/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(request, ["admin"]);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;
  const supabaseAdmin = createServerSupabaseAdmin();
  const supabase = createServerSupabase();
  const body = await request.json();

  try {
    const { data: user, error } = await supabaseAdmin.auth.admin.updateUserById(
      id,
      {
        email: body.email,
        password: body.password,
      }
    );

    if (error) throw error;

    if (user) {
      const { data, error: updateError } = await supabase
        .from("PersonnelProfiles")
        .update(body)
        .eq("id", id);

      if (updateError) throw updateError;
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/personnel/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(request, ["admin"]);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;
  const supabaseAdmin = createServerSupabaseAdmin();

  try {
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
