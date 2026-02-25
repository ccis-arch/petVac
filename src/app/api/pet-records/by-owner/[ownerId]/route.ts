import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

// GET /api/pet-records/by-owner/[ownerId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ownerId: string }> }
) {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const { ownerId } = await params;
  const supabase = createServerSupabase();

  try {
    const { data, error } = await supabase
      .from("PetRecords")
      .select("*")
      .eq("owner_id", ownerId)
      .order("birth_date", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
