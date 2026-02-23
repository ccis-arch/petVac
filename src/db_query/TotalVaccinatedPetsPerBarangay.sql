create view
  public."TotalVaccinatedPetsPerBarangay" as
select
  p.barangay,
  count(*) as total_vaccinated
from
  "PetRecords" r
  join "PetOwnerProfiles" p on r.owner_id = p.id
where
  r.date_vaccinated is not null
group by
  p.barangay;