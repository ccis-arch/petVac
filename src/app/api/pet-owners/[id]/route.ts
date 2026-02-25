import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole, isAuthError } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

// GET /api/pet-owners/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;
  const supabase = createServerSupabase();

  try {
    const { data, error } = await supabase
      .from("PetOwnerProfiles")
      .select("first_name, last_name")
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/pet-owners/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;
  const supabase = createServerSupabase();
  const body = await request.json();

  try {
    const { data, error } = await supabase
      .from("PetOwnerProfiles")
      .update(body)
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ data, error: null });
  } catch (error: any) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }
}

// DELETE /api/pet-owners/[id]
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
      .from("PetOwnerProfiles")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
