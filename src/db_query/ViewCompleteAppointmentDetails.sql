create view
  public."ViewCompleteAppointmentDetails" as
select
  ap.id,
  ap.ticket_num,
  ap.status,
  pr.id as pet_id,
  pr.date_vaccinated,
  pr.pet_name,
  concat(pop.first_name, ' ', pop.last_name) as pet_owner,
  pop.id as owner_id,
  vs.location as vaccine_location,
  max(vi.id) as vaccine_id,
  max(vi.name) as vaccine_name,
  max(vi.remaining_qty) as vaccine_qty,
  max(vi.status) as vaccine_status,
  vs.start_date as appointment_date,
  vs.start_time as appointment_time
from
  "AppointmentRecords" ap
  join "PetRecords" pr on pr.id = ap.pet_id
  join "PetOwnerProfiles" pop on pop.id = ap.owner_id
  join "VaccinationSchedule" vs on vs.id = ap.vaccine_sched_id
  left join "VaccinationRecords" vr on vr.vax_sched_id = vs.id
  and vr.pet_id = pr.id
  left join "VaccineInventory" vi on vi.id = vr.vaccine_id
group by
  ap.id,
  ap.ticket_num,
  ap.status,
  pr.id,
  pr.date_vaccinated,
  pr.pet_name,
  (concat(pop.first_name, ' ', pop.last_name)),
  pop.id,
  vs.location,
  vs.start_date,
  vs.start_time;