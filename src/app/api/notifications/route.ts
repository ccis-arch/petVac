import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole, isAuthError } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

// GET /api/notifications
export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "personnel"]);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();

  try {
    const { data, error } = await supabase
      .from("AdminNotifications")
      .select()
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data, error: null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/notifications
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const body = await request.json();

  try {
    const response = await supabase.from("AdminNotifications").insert(body);
    if (response.error) throw response.error;
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/notifications (delete all)
export async function DELETE(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      const { data, error } = await supabase
        .from("AdminNotifications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return NextResponse.json(data);
    }

    // Delete all
    const { data, error } = await supabase
      .from("AdminNotifications")
      .delete()
      .match({});

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
