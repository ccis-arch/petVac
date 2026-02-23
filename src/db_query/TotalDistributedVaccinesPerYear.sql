create view
  public."TotalDistributedVaccinesPerYear" as
select
  extract(
    year
    from
      "DistributedVaccines".date
  ) as year,
  count(*) as total_distributed_vaccines
from
  "DistributedVaccines"
group by
  (
    extract(
      year
      from
        "DistributedVaccines".date
    )
  );