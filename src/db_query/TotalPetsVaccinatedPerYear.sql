create view
  public."TotalPetsVaccinatedPerYear" as
select
  extract(
    year
    from
      "VaccinationRecords".created_at
  ) as year,
  count(*) as total_pets_vaccinated
from
  "VaccinationRecords"
group by
  (
    extract(
      year
      from
        "VaccinationRecords".created_at
    )
  );