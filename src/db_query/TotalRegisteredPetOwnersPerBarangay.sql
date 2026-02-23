create view
  public."TotalRegisteredPetOwnersPerBarangay" as
select
  "PetOwnerProfiles".barangay,
  count(*) as total_registered_pet_owners
from
  "PetOwnerProfiles"
group by
  "PetOwnerProfiles".barangay;