create view
  public."TotalRegisteredPetOwners" as
select
  count(*) as total_registered_pet_owner
from
  "PetOwnerProfiles";