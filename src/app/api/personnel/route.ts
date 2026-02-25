import { NextRequest, NextResponse } from "next/server";
import { requireRole, isAuthError } from "@/lib/auth";
import { createServerSupabase, createServerSupabaseAdmin } from "@/lib/supabase-server";

// GET /api/personnel
export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const entriesPerPage = parseInt(searchParams.get("entriesPerPage") || "10");
  const currentPage = parseInt(searchParams.get("currentPage") || "1");
  const offset = (currentPage - 1) * entriesPerPage;

  try {
    let query = supabase
      .from("PersonnelProfiles")
      .select("*", { count: "exact" })
      .order("last_name", { ascending: false })
      .order("first_name", { ascending: false });

    if (search) {
      query = query.or(
        `email.ilike.%${search}%,last_name.ilike.%${search}%,first_name.ilike.%${search}%,address.ilike.%${search}%`
      );
    }

    const response = await query.range(offset, offset + entriesPerPage - 1);
    if (response.error) throw response.error;
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/personnel
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]);
  if (isAuthError(authResult)) return authResult;

  const supabaseAdmin = createServerSupabaseAdmin();
  const supabase = createServerSupabase();
  const body = await request.json();
  const { email, password, profile } = body;

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) throw error;

    const user = data?.user;
    if (user) {
      const { data: profileData, error: insertError } = await supabase
        .from("PersonnelProfiles")
        .insert({ id: user.id, ...profile });

      if (insertError) throw insertError;
      return NextResponse.json({ profileData, userID: user.id });
    }

    return NextResponse.json({ error: "User creation failed" }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
