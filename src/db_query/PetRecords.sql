create table
  public."PetRecords" (
    id uuid not null default gen_random_uuid (),
    pet_name text not null,
    specie character varying not null,
    sex character varying not null,
    breed character varying null,
    birth_date date not null,
    weight integer null,
    color character varying null,
    owner_id uuid not null,
    date_vaccinated date null,
    pet_origin text null,
    ownership text null,
    habitat text null,
    tag text null,
    is_pregnant boolean null,
    num_puppies smallint null default '0'::smallint,
    is_lactating_with_puppies boolean null,
    constraint PetRecords_pkey primary key (id),
    constraint PetRecords_owner_id_fkey foreign key (owner_id) references "PetOwnerProfiles" (id) on update cascade on delete cascade
  ) tablespace pg_default;