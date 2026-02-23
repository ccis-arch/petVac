create view
  public."ViewPetRecordsForVaccination" as
select
  pr.id,
  ar.id as schedule_id,
  vs.start_date as appointment_date,
  ar.status,
  pr.pet_name,
  pop.first_name,
  pop.last_name,
  pr.date_vaccinated,
  ar.vaccine_sched_id
from
  "PetRecords" pr
  join "PetOwnerProfiles" pop on pop.id = pr.owner_id
  join "AppointmentRecords" ar on ar.pet_id = pr.id
  left join "VaccinationSchedule" vs on vs.id = ar.vaccine_sched_id;

-- if something happens to the view, run this:
-- CREATE OR REPLACE VIEW "ViewPetRecordsForVaccination" AS
-- SELECT
--     pr.id,
--     ar.id AS schedule_id,
--     vs.start_date AS appointment_date,
--     ar.status,
--     pr.pet_name,
--     pop.first_name,
--     pop.last_name,
--     pr.date_vaccinated,
--     ar.vaccine_sched_id
-- FROM
--     "PetRecords" pr
--     JOIN "PetOwnerProfiles" pop ON pop.id = pr.owner_id
--     JOIN "AppointmentRecords" ar ON ar.pet_id = pr.id
--     JOIN "VaccinationSchedule" vs ON vs.id = ar.vaccine_sched_id;