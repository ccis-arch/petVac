create table
  public."VaccinationSchedule" (
    id bigint not null,
    title text not null,
    start_date date not null,
    start_time time without time zone not null,
    end_date date not null,
    end_time time without time zone not null,
    location text not null,
    note text null,
    "allDay" boolean not null default true,
    constraint vaccine_schedule_pkey primary key (id)
  ) tablespace pg_default;