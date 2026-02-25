import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

// GET /api/pet-owners/search?name=...
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || "";

  try {
    let query = supabase.from("PetOwnerProfiles").select("*");

    if (name) {
      query = query.or(`first_name.ilike.%${name}%,last_name.ilike.%${name}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
