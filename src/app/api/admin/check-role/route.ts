import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // Check if user is personnel
    const { data: personnelData } = await supabaseAdmin
      .from("PersonnelProfiles")
      .select("id, first_name, last_name")
      .eq("id", userId);

    if (personnelData && personnelData.length > 0) {
      return NextResponse.json({
        role: "personnel",
        name: `${personnelData[0]?.first_name} ${personnelData[0]?.last_name}`,
      });
    }

    // Check if user is pet owner
    const { data: petOwnerData } = await supabaseAdmin
      .from("PetOwnerProfiles")
      .select("id, first_name, last_name, barangay")
      .eq("id", userId);

    if (petOwnerData && petOwnerData.length > 0) {
      return NextResponse.json({
        role: "pet-owner",
        name: `${petOwnerData[0]?.first_name} ${petOwnerData[0]?.last_name}`,
        barangay: petOwnerData[0]?.barangay,
      });
    }

    // Check admin (not in any profile table)
    const { data: adminData1 } = await supabaseAdmin
      .from("PersonnelProfiles")
      .select("id")
      .eq("id", userId);

    const { data: adminData2 } = await supabaseAdmin
      .from("PetOwnerProfiles")
      .select("id")
      .eq("id", userId);

    if (
      (adminData1 && adminData1.length === 0) &&
      (adminData2 && adminData2.length === 0)
    ) {
      return NextResponse.json({ role: "admin", name: "Admin" });
    }

    return NextResponse.json({ role: null });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
