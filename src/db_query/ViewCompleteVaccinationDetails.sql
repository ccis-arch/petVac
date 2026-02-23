create view
  public."ViewCompleteVaccinationDetails" as
select
  vr.id as vaccination_record_id,
  vr.created_at,
  vr.vax_sched_id,
  vr.vaccine_id,
  vr.pet_id,
  pr.owner_id,
  pr.pet_name,
  pr.breed,
  concat(pop.first_name, ' ', pop.last_name) as pet_owner,
  vi.name as vaccine_name,
  vs.start_date as vax_sched_date,
  vs.location
from
  "VaccinationRecords" vr
  join "PetRecords" pr on vr.pet_id = pr.id
  join "PetOwnerProfiles" pop on pr.owner_id = pop.id
  join "VaccineInventory" vi on vr.vaccine_id = vi.id
  join "VaccinationSchedule" vs on vr.vax_sched_id = vs.id;