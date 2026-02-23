-- Total number of rows of the table VaccinationRecords as "total_pets_vaccinated" grouped by year
CREATE
OR REPLACE VIEW "TotalPetsVaccinatedPerYear" AS
SELECT
    EXTRACT(
        YEAR
        FROM
            created_at
    ) AS year,
    COUNT(*) AS total_pets_vaccinated
FROM
    "VaccinationRecords"
GROUP BY
    year;

-- The total rows of table DistributedVaccines as "total_distributed_vaccines" grouped by year
CREATE
OR REPLACE VIEW "TotalDistributedVaccinesPerYear" AS
SELECT
    EXTRACT(
        YEAR
        FROM
            date
    ) AS year,
    COUNT(*) AS total_distributed_vaccines
FROM
    "DistributedVaccines"
GROUP BY
    year;

-- The total rows of table PetOwnerProfiles as "total_registered_pet_owner"
CREATE
OR REPLACE VIEW "TotalRegisteredPetOwners" AS
SELECT
    COUNT(*) AS total_registered_pet_owner
FROM
    "PetOwnerProfiles";

-- The total cat (specie), and total dog (specie), that their date_vaccinated is not null (in PetRecords)
CREATE
OR REPLACE VIEW "TotalVaccinatedCatsAndDogs" AS
SELECT
    specie,
    COUNT(*) AS total_vaccinated
FROM
    "PetRecords"
WHERE
    date_vaccinated IS NOT NULL
    AND specie IN ('cat', 'dog')
GROUP BY
    specie;

CREATE
OR REPLACE VIEW "TotalMonthlyVaccinatedPets" AS
SELECT
    EXTRACT(
        MONTH
        FROM
            date_vaccinated
    ) AS month,
    COUNT(*) AS total_vaccinated
FROM
    "PetRecords"
WHERE
    date_vaccinated IS NOT NULL
GROUP BY
    month;

CREATE
OR REPLACE VIEW "TotalMonthlyVaccinatedPets" AS
SELECT
    EXTRACT(
        MONTH
        FROM
            date_vaccinated
    ) AS month,
    COUNT(*) AS total_vaccinated
FROM
    "PetRecords"
WHERE
    date_vaccinated IS NOT NULL
GROUP BY
    month;

CREATE
OR REPLACE VIEW "TotalVaccinatedPetsPerBarangay" AS
SELECT
    p.barangay,
    COUNT(*) AS total_vaccinated
FROM
    "PetRecords" r
    JOIN "PetOwnerProfiles" p ON r.owner_id = p.id
WHERE
    r.date_vaccinated IS NOT NULL
GROUP BY
    p.barangay;

CREATE
OR REPLACE VIEW "TotalRegisteredPetOwnersPerBarangay" AS
SELECT
    barangay,
    COUNT(*) AS total_registered_pet_owners
FROM
    "PetOwnerProfiles"
GROUP BY
    barangay;