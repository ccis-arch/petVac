create table
  public."PetOwnerProfiles" (
    id uuid not null,
    date_registered date not null,
    last_name character varying not null,
    first_name character varying not null,
    gender character varying null,
    birth_date date null,
    barangay character varying null,
    phone_number character varying not null,
    email text null,
    password text null,
    constraint pet_owner_records_pkey primary key (id),
    constraint PetOwnerProfiles_id_fkey foreign key (id) references auth.users (id) on update cascade on delete cascade
  ) tablespace pg_default;