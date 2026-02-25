import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole, isAuthError } from "@/lib/auth";
import { createServerSupabase, createServerSupabaseAdmin } from "@/lib/supabase-server";

// GET /api/pet-owners - fetch pet owners with search, filter, pagination
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const location = searchParams.get("location") || "";
  const entriesPerPage = parseInt(searchParams.get("entriesPerPage") || "10");
  const currentPage = parseInt(searchParams.get("currentPage") || "1");
  const offset = (currentPage - 1) * entriesPerPage;

  try {
    let query = supabase
      .from("PetOwnerProfiles")
      .select("*", { count: "exact" });

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,gender.ilike.%${search}%,barangay.ilike.%${search}%`
      );
    }

    if (location) {
      query = query.eq("barangay", location);
    }

    const { data, error, status, count } = await query.range(
      offset,
      offset + entriesPerPage - 1
    );

    if (error) throw error;

    const petCounts = await supabase.rpc("get_pet_counts");
    if (petCounts.error) throw petCounts.error;

    return NextResponse.json({
      data,
      petCounts: petCounts.data,
      count,
      status,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/pet-owners - create a new pet owner user
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "personnel"]);
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
        .from("PetOwnerProfiles")
        .insert({ id: user.id, ...profile });

      if (insertError) throw insertError;

      return NextResponse.json({ profileData, userID: user.id });
    }

    return NextResponse.json({ error: "User creation failed" }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
