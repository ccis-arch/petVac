import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { createServerSupabase, createServerSupabaseAdmin } from "@/lib/supabase-server";

// GET /api/auth/user?userId=... - get user email
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || authResult.user.id;
  const supabaseAdmin = createServerSupabaseAdmin();

  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error) throw error;

    return NextResponse.json({
      email: data.user.email,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/auth/user - update user email or password
export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const supabaseAdmin = createServerSupabaseAdmin();
  const supabase = createServerSupabase();
  const body = await request.json();
  const { userId, editType, email, password, currentEmail, profileTable } = body;

  try {
    if (editType === "email") {
      const { data: user, error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { email }
      );

      if (error) throw error;

      // Update profile table if specified
      if (profileTable) {
        const { error: profileError } = await supabase
          .from(profileTable)
          .update({ email })
          .eq("id", userId);

        if (profileError) {
          // Rollback auth email change
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            email: currentEmail,
          });
          throw profileError;
        }
      }

      return NextResponse.json({ success: true });
    }

    if (editType === "password") {
      const { data: user, error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password }
      );

      if (error) throw error;

      // Update profile table if specified
      if (profileTable) {
        const { error: profileError } = await supabase
          .from(profileTable)
          .update({ password })
          .eq("id", userId);

        if (profileError) {
          // Note: can't easily rollback password changes
          console.error("Error updating profile password:", profileError);
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid editType" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
