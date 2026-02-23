create view
  public."TotalVaccinatedCatsAndDogs" as
select
  "PetRecords".specie,
  count(*) as total_vaccinated
from
  "PetRecords"
where
  "PetRecords".date_vaccinated is not null
  and (
    "PetRecords".specie::text = any (
      array[
        'cat'::character varying::text,
        'dog'::character varying::text
      ]
    )
  )
group by
  "PetRecords".specie;