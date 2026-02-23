create view
  public."ViewVaccinationRecordsEachBarangay" as
select
  vs.location,
  vs.start_date as vax_sched_date,
  count(*) as record_count
from
  "VaccinationRecords" vr
  join "VaccinationSchedule" vs on vr.vax_sched_id = vs.id
group by
  vs.location,
  vs.start_date;