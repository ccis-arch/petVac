import { supabase } from "@/utils/supabase";

// overview
export const fetchVaccinatedPets = async (barangay: string) => {
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
  // query = query.eq("VaccinationSchedule.location", "Consuelo");

  const response = await query;

  if (response.error) {
    console.error("Error fetching data:", response.error);
    return;
  }

  const totalRecords: { [key: string]: number } = {};
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentYear = new Date().getFullYear();

  response.data.forEach((record) => {
    const recordDate = new Date(record.created_at);
    if (recordDate.getFullYear() === currentYear) {
      const month = monthNames[recordDate.getMonth()];
      if (!totalRecords[month]) {
        totalRecords[month] = 0;
      }
      totalRecords[month]++;
    }
  });

  const filteredData = response.data.filter(
    (record) => new Date(record.created_at).getFullYear() === currentYear
  );

  const allPetRecords = filteredData.flatMap((record) => record.PetRecords);

  const totalCats: any = allPetRecords.filter(
    (petRecord) => petRecord.specie === "cat"
  ).length;

  const totalDogs: any = allPetRecords.filter(
    (petRecord) => petRecord.specie === "dog"
  ).length;

  return { totalRecords, totalCats, totalDogs };
};

export const fetchVaccinatedPetsByBarangay = async () => {
  const response = await supabase
    .from("VaccinationRecords")
    .select(`PetRecords!inner (PetOwnerProfiles!inner (barangay))`);

  if (response.error) {
    console.error("Error fetching data:", response.error);
    return;
  }

  const barangayTotals: { [key: string]: number } = {};

  response.data.forEach((record: any) => {
    const barangay = record.PetRecords.PetOwnerProfiles.barangay;
    if (!barangayTotals[barangay]) {
      barangayTotals[barangay] = 0;
    }
    barangayTotals[barangay]++;
  });

  return barangayTotals;
};

// overview
export const fetchVaccinatedPetsAllBarangay = async () => {
  try {
    let query = supabase
      .from("VaccinationRecords")
      .select(`*`, { count: "exact" });

    const { data, error, status, count } = await query;

    if (error) {
      throw error;
    }

    return {
      data: data,
      count: count,
      status: status,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

// export const fetchVaccinationRecordsByOwnerID = async (ownerId: string) => {
//   try {
//     const { data, error } = await supabase
//       .from("VaccinationRecords")
//       .select(
//         `created_at, vax_sched_id,
//         VaccinationSchedule!inner (id, start_date, start_time, end_time, location),
//         VaccineInventory!inner (id, name, stockin_date, status),
//         PetRecords!inner (id, pet_name, specie, status, owner_id, PetOwnerProfiles!inner (id, first_name, last_name, barangay))
//         `
//       )
//       .eq("PetRecords.owner_id", ownerId)
//       .order("created_at", { ascending: false });

//     if (error) {
//       throw error;
//     }

//     return data;
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     return null;
//   }
// };

// for Overview (admin):
export const fetchVaccinationRecordsEachBarangay = async (date: string) => {
  try {
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
        .filter(
          "vax_sched_date",
          "lt",
          `${nextYear}-${nextMonth}-01T00:00:00Z`
        );
    } else {
      query = query
        .filter("vax_sched_date", "gte", `${currentYear}-01-01T00:00:00Z`)
        .filter("vax_sched_date", "lt", `${currentYear + 1}-01-01T00:00:00Z`);
    }

    const response = await query;
    if (response.error) {
      throw response.error;
    }
    return response.data || [];
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchVaccinationRecordsEachBarangayMoreDetails = async (
  date: string
) => {
  try {
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
        .filter(
          "vax_sched_date",
          "lt",
          `${nextYear}-${nextMonth}-01T00:00:00Z`
        );
    } else {
      query = query
        .filter("vax_sched_date", "gte", `${currentYear}-01-01T00:00:00Z`)
        .filter("vax_sched_date", "lt", `${currentYear + 1}-01-01T00:00:00Z`);
    }

    const response = await query;
    if (response.error) {
      throw response.error;
    }
    return response.data || [];
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchVaccinationRecordsByOwnerID = async (ownerId: string) => {
  try {
    const { data, error } = await supabase
      .from("ViewCompleteVaccinationDetails")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const insertVaccinationRecord = async (data: any) => {
  try {
    const response = await supabase
      .from("VaccinationRecords")
      .insert(data)
      .select();

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error inserting into table:", error);
    return null;
  }
};
