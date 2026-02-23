create view
  public."TotalMonthlyVaccinatedPets" as
select
  extract(
    month
    from
      "PetRecords".date_vaccinated
  ) as month,
  count(*) as total_vaccinated
from
  "PetRecords"
where
  "PetRecords".date_vaccinated is not null
group by
  (
    extract(
      month
      from
        "PetRecords".date_vaccinated
    )
  );