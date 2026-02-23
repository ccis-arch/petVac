create table
  public."PersonnelProfiles" (
    id uuid not null,
    email text null,
    password text null,
    last_name text null,
    first_name text null,
    phone_number text null,
    address text null,
    constraint personnel_profiles_pkey primary key (id),
    constraint PersonnelProfiles_id_fkey foreign key (id) references auth.users (id) on delete cascade
  ) tablespace pg_default;