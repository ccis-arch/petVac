create view
  public."ViewGeneralReport" as
select
  extract(
    year
    from
      pop.date_registered
  ) as year,
  pop.barangay,
  vi.name as vaccine,
  sum(
    case
      when vi.status = 'distributed'::text then 1
      else 0
    end
  ) as distributed_vaccines,
  sum(
    case
      when vi.status = 'remain'::text then 1
      else 0
    end
  ) as remaining_vaccines,
  count(
    distinct case
      when ap.status = 'ved'::text then pr.id
      else null::uuid
    end
  ) as vaccinated_pets,
  count(
    distinct case
      when ap.status = 'uved'::text then pr.id
      else null::uuid
    end
  ) as unvaccinated_pets,
  count(distinct pop.id) as registered_pet_owners
from
  "PetOwnerProfiles" pop
  join "PetRecords" pr on pr.owner_id = pop.id
  join "AppointmentRecords" ap on ap.pet_id = pr.id
  join "VaccinationSchedule" vs on vs.id = ap.vaccine_sched_id
  join "VaccinationRecords" vr on vr.vax_sched_id = vs.id
  join "VaccineInventory" vi on vi.id = vr.vaccine_id
group by
  (
    extract(
      year
      from
        pop.date_registered
    )
  ),
  pop.barangay,
  vi.name;