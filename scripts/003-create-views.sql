-- View: Complete Vaccination Details
CREATE OR REPLACE VIEW public."ViewCompleteVaccinationDetails" AS
SELECT
  vr.id AS vaccination_record_id,
  vr.created_at,
  vr.vax_sched_id,
  vr.vaccine_id,
  vr.pet_id,
  pr.owner_id,
  pr.pet_name,
  pr.breed,
  CONCAT(pop.first_name, ' ', pop.last_name) AS pet_owner,
  vi.name AS vaccine_name,
  vs.start_date AS vax_sched_date,
  vs.location
FROM
  "VaccinationRecords" vr
  JOIN "PetRecords" pr ON vr.pet_id = pr.id
  JOIN "PetOwnerProfiles" pop ON pr.owner_id = pop.id
  JOIN "VaccineInventory" vi ON vr.vaccine_id = vi.id
  JOIN "VaccinationSchedule" vs ON vr.vax_sched_id = vs.id;

-- View: Pet Records With Owners
CREATE OR REPLACE VIEW public."ViewPetRecordsWithOwners" AS
SELECT
  pr.id,
  pr.pet_name,
  pr.specie,
  pr.sex,
  pr.breed,
  pr.birth_date,
  pr.weight,
  pr.color,
  pr.owner_id,
  pr.date_vaccinated,
  pr.pet_origin,
  pr.ownership,
  pr.habitat,
  pr.tag,
  pr.is_pregnant,
  pr.num_puppies,
  pr.is_lactating_with_puppies,
  pop.date_registered AS owner_date_registered,
  pop.last_name AS owner_last_name,
  pop.first_name AS owner_first_name,
  pop.gender AS owner_gender,
  pop.birth_date AS owner_birth_date,
  pop.barangay AS owner_barangay
FROM
  "PetRecords" pr
  JOIN "PetOwnerProfiles" pop ON pr.owner_id = pop.id;

-- View: Complete Appointment Details
CREATE OR REPLACE VIEW public."ViewCompleteAppointmentDetails" AS
SELECT
  ap.id,
  ap.ticket_num,
  ap.status,
  pr.id AS pet_id,
  pr.date_vaccinated,
  pr.pet_name,
  CONCAT(pop.first_name, ' ', pop.last_name) AS pet_owner,
  pop.id AS owner_id,
  vs.location AS vaccine_location,
  MAX(vi.id) AS vaccine_id,
  MAX(vi.name) AS vaccine_name,
  MAX(vi.remaining_qty) AS vaccine_qty,
  MAX(vi.status) AS vaccine_status,
  vs.start_date AS appointment_date,
  vs.start_time AS appointment_time
FROM
  "AppointmentRecords" ap
  JOIN "PetRecords" pr ON pr.id = ap.pet_id
  JOIN "PetOwnerProfiles" pop ON pop.id = ap.owner_id
  JOIN "VaccinationSchedule" vs ON vs.id = ap.vaccine_sched_id
  LEFT JOIN "VaccinationRecords" vr ON vr.vax_sched_id = vs.id AND vr.pet_id = pr.id
  LEFT JOIN "VaccineInventory" vi ON vi.id = vr.vaccine_id
GROUP BY
  ap.id,
  ap.ticket_num,
  ap.status,
  pr.id,
  pr.date_vaccinated,
  pr.pet_name,
  CONCAT(pop.first_name, ' ', pop.last_name),
  pop.id,
  vs.location,
  vs.start_date,
  vs.start_time;

-- View: General Report
CREATE OR REPLACE VIEW public."ViewGeneralReport" AS
SELECT
  EXTRACT(YEAR FROM pop.date_registered) AS year,
  pop.barangay,
  vi.name AS vaccine,
  SUM(CASE WHEN vi.status = 'distributed' THEN 1 ELSE 0 END) AS distributed_vaccines,
  SUM(CASE WHEN vi.status = 'remain' THEN 1 ELSE 0 END) AS remaining_vaccines,
  COUNT(DISTINCT CASE WHEN ap.status = 'ved' THEN pr.id ELSE NULL END) AS vaccinated_pets,
  COUNT(DISTINCT CASE WHEN ap.status = 'uved' THEN pr.id ELSE NULL END) AS unvaccinated_pets,
  COUNT(DISTINCT pop.id) AS registered_pet_owners
FROM
  "PetOwnerProfiles" pop
  JOIN "PetRecords" pr ON pr.owner_id = pop.id
  JOIN "AppointmentRecords" ap ON ap.pet_id = pr.id
  JOIN "VaccinationSchedule" vs ON vs.id = ap.vaccine_sched_id
  JOIN "VaccinationRecords" vr ON vr.vax_sched_id = vs.id
  JOIN "VaccineInventory" vi ON vi.id = vr.vaccine_id
GROUP BY
  EXTRACT(YEAR FROM pop.date_registered),
  pop.barangay,
  vi.name;

-- View: Pet Records For Vaccination
CREATE OR REPLACE VIEW public."ViewPetRecordsForVaccination" AS
SELECT
  pr.id,
  ar.id AS schedule_id,
  vs.start_date AS appointment_date,
  ar.status,
  pr.pet_name,
  pop.first_name,
  pop.last_name,
  pr.date_vaccinated,
  ar.vaccine_sched_id
FROM
  "PetRecords" pr
  JOIN "PetOwnerProfiles" pop ON pop.id = pr.owner_id
  JOIN "AppointmentRecords" ar ON ar.pet_id = pr.id
  LEFT JOIN "VaccinationSchedule" vs ON vs.id = ar.vaccine_sched_id;

-- View: Vaccination Records Each Barangay
CREATE OR REPLACE VIEW public."ViewVaccinationRecordsEachBarangay" AS
SELECT
  vs.location,
  vs.start_date AS vax_sched_date,
  COUNT(*) AS record_count
FROM
  "VaccinationRecords" vr
  JOIN "VaccinationSchedule" vs ON vr.vax_sched_id = vs.id
GROUP BY
  vs.location,
  vs.start_date;
