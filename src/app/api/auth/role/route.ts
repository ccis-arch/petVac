import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, getUserRole } from "@/lib/auth";
import { createServerSupabaseAdmin } from "@/lib/supabase-server";

// GET /api/auth/role - returns the user's role and profile info
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createServerSupabaseAdmin();

  // Check if personnel
  const { data: personnelData } = await supabaseAdmin
    .from("PersonnelProfiles")
    .select("id, first_name, last_name")
    .eq("id", user.id);

  if (personnelData && personnelData.length > 0) {
    return NextResponse.json({
      role: "personnel",
      user: {
        id: user.id,
        name: `${personnelData[0].first_name} ${personnelData[0].last_name}`,
      },
    });
  }

  // Check if pet owner
  const { data: petOwnerData } = await supabaseAdmin
    .from("PetOwnerProfiles")
    .select("id, first_name, last_name, barangay")
    .eq("id", user.id);

  if (petOwnerData && petOwnerData.length > 0) {
    return NextResponse.json({
      role: "pet-owner",
      user: {
        id: user.id,
        name: `${petOwnerData[0].first_name} ${petOwnerData[0].last_name}`,
        barangay: petOwnerData[0].barangay,
      },
    });
  }

  // If not in either table, they are admin
  return NextResponse.json({
    role: "admin",
    user: {
      id: user.id,
      name: "Admin",
    },
  });
}
