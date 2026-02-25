import { NextRequest, NextResponse } from "next/server";
import { requireRole, isAuthError } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

// GET /api/cascade-checks?type=vaccination-pet|distributed-inventory|vaccine-inventory
export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "personnel"]);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "";

  try {
    if (type === "vaccination-pet") {
      const pet_id = searchParams.get("pet_id") || "";

      const { data, error } = await supabase
        .from("VaccinationRecords")
        .select("vaccine_id")
        .eq("pet_id", pet_id);

      if (error) throw error;
      return NextResponse.json(data);
    }

    if (type === "distributed-inventory") {
      const inventory_id = parseInt(searchParams.get("inventory_id") || "0");

      const { data, error } = await supabase
        .from("DistributedVaccines")
        .select("id, num_vaccines")
        .eq("inventory_id", inventory_id);

      if (error) throw error;
      return NextResponse.json(data);
    }

    if (type === "vaccine-inventory") {
      const inventory_id = parseInt(searchParams.get("inventory_id") || "0");

      const { data, error } = await supabase
        .from("VaccineInventory")
        .select("id, remaining_qty")
        .eq("id", inventory_id);

      if (error) throw error;
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
