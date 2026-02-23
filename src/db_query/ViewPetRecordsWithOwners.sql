create view
  public."ViewPetRecordsWithOwners" as
select
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
  pop.date_registered as owner_date_registered,
  pop.last_name as owner_last_name,
  pop.first_name as owner_first_name,
  pop.gender as owner_gender,
  pop.birth_date as owner_birth_date,
  pop.barangay as owner_barangay
from
  "PetRecords" pr
  join "PetOwnerProfiles" pop on pr.owner_id = pop.id;