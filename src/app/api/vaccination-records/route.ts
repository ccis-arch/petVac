import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole, isAuthError } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

// GET /api/vaccination-records?type=stats|by-barangay|by-owner|details|all
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "all";

  try {
    // fetchVaccinatedPets
    if (type === "stats") {
      const barangay = searchParams.get("barangay") || "";

      let query = supabase.from("VaccinationRecords").select(
        `created_at, vax_sched_id,
        VaccinationSchedule!inner (id, start_date, start_time, end_time, location),
        VaccineInventory!inner (id, name, stockin_date, status),
        PetRecords!inner (id, pet_name, specie, status, PetOwnerProfiles!inner (id, first_name, last_name, barangay))
        `
      );

      if (barangay !== "") {
        query = query.eq("VaccinationSchedule.location", barangay);
      }

      const response = await query;
      if (response.error) throw response.error;

      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      const currentYear = new Date().getFullYear();
      const totalRecords: { [key: string]: number } = {};

      response.data.forEach((record: any) => {
        const recordDate = new Date(record.created_at);
        if (recordDate.getFullYear() === currentYear) {
          const month = monthNames[recordDate.getMonth()];
          if (!totalRecords[month]) totalRecords[month] = 0;
          totalRecords[month]++;
        }
      });

      const filteredData = response.data.filter(
        (record: any) => new Date(record.created_at).getFullYear() === currentYear
      );

      const allPetRecords = filteredData.flatMap((record: any) => record.PetRecords);
      const totalCats = allPetRecords.filter((r: any) => r.specie === "cat").length;
      const totalDogs = allPetRecords.filter((r: any) => r.specie === "dog").length;

      return NextResponse.json({ totalRecords, totalCats, totalDogs });
    }

    // fetchVaccinatedPetsByBarangay
    if (type === "by-barangay-totals") {
      const response = await supabase
        .from("VaccinationRecords")
        .select(`PetRecords!inner (PetOwnerProfiles!inner (barangay))`);

      if (response.error) throw response.error;

      const barangayTotals: { [key: string]: number } = {};
      response.data.forEach((record: any) => {
        const barangay = record.PetRecords.PetOwnerProfiles.barangay;
        if (!barangayTotals[barangay]) barangayTotals[barangay] = 0;
        barangayTotals[barangay]++;
      });

      return NextResponse.json(barangayTotals);
    }

    // fetchVaccinatedPetsAllBarangay
    if (type === "all-count") {
      const { data, error, status, count } = await supabase
        .from("VaccinationRecords")
        .select("*", { count: "exact" });

      if (error) throw error;
      return NextResponse.json({ data, count, status });
    }

    // fetchVaccinationRecordsEachBarangay
    if (type === "each-barangay") {
      const date = searchParams.get("date") || "";
      const currentYear = new Date().getFullYear();

      let query = supabase
        .from("ViewVaccinationRecordsEachBarangay")
        .select("*")
        .order("vax_sched_date", { ascending: false });

      if (date) {
        const year = date.slice(0, 4);
        const month = date.slice(5);
        const nextMonth = ("0" + ((parseInt(month) % 12) + 1)).slice(-2);
        const nextYear = month === "12" ? parseInt(year) + 1 : year;

        query = query
          .filter("vax_sched_date", "gte", `${year}-${month}-01T00:00:00Z`)
          .filter("vax_sched_date", "lt", `${nextYear}-${nextMonth}-01T00:00:00Z`);
      } else {
        query = query
          .filter("vax_sched_date", "gte", `${currentYear}-01-01T00:00:00Z`)
          .filter("vax_sched_date", "lt", `${currentYear + 1}-01-01T00:00:00Z`);
      }

      const response = await query;
      if (response.error) throw response.error;
      return NextResponse.json(response.data || []);
    }

    // fetchVaccinationRecordsEachBarangayMoreDetails
    if (type === "each-barangay-details") {
      const date = searchParams.get("date") || "";
      const currentYear = new Date().getFullYear();

      let query = supabase
        .from("ViewCompleteVaccinationDetails")
        .select("*")
        .order("vax_sched_date", { ascending: false })
        .order("location", { ascending: true })
        .order("pet_name", { ascending: true });

      if (date) {
        const year = date.slice(0, 4);
        const month = date.slice(5);
        const nextMonth = ("0" + ((parseInt(month) % 12) + 1)).slice(-2);
        const nextYear = month === "12" ? parseInt(year) + 1 : year;

        query = query
          .filter("vax_sched_date", "gte", `${year}-${month}-01T00:00:00Z`)
          .filter("vax_sched_date", "lt", `${nextYear}-${nextMonth}-01T00:00:00Z`);
      } else {
        query = query
          .filter("vax_sched_date", "gte", `${currentYear}-01-01T00:00:00Z`)
          .filter("vax_sched_date", "lt", `${currentYear + 1}-01-01T00:00:00Z`);
      }

      const response = await query;
      if (response.error) throw response.error;
      return NextResponse.json(response.data || []);
    }

    // fetchVaccinationRecordsByOwnerID
    if (type === "by-owner") {
      const ownerId = searchParams.get("ownerId") || "";
      const { data, error } = await supabase
        .from("ViewCompleteVaccinationDetails")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return NextResponse.json(data);
    }

    // fetchCompleteVaccinationDetailsData
    if (type === "details") {
      const search = searchParams.get("search") || "";
      const entriesPerPage = parseInt(searchParams.get("entriesPerPage") || "10");
      const currentPage = parseInt(searchParams.get("currentPage") || "1");
      const offset = (currentPage - 1) * entriesPerPage;

      let query = supabase
        .from("ViewCompleteVaccinationDetails")
        .select("*")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(
          `location.ilike.%${search}%,vaccine_name.ilike.%${search}%,pet_owner.ilike.%${search}%,pet_name.ilike.%${search}%`
        );
      }

      const response = await query.range(offset, offset + entriesPerPage - 1);
      if (response.error) throw response.error;
      return NextResponse.json(response);
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/vaccination-records
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "personnel"]);
  if (isAuthError(authResult)) return authResult;

  const supabase = createServerSupabase();
  const body = await request.json();

  try {
    const response = await supabase
      .from("VaccinationRecords")
      .insert(body)
      .select();

    if (response.error) throw response.error;
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
