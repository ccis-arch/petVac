-- ============================================
-- PetVac Database: Overview Views, RPC Function, and RLS Policies
-- ============================================

-- ==========================================
-- Overview Views (for dashboard/reporting)
-- ==========================================

-- Total pets vaccinated per year
CREATE OR REPLACE VIEW "TotalPetsVaccinatedPerYear" AS
SELECT
    EXTRACT(YEAR FROM created_at) AS year,
    COUNT(*) AS total_pets_vaccinated
FROM "VaccinationRecords"
GROUP BY year;

-- Total distributed vaccines per year
CREATE OR REPLACE VIEW "TotalDistributedVaccinesPerYear" AS
SELECT
    EXTRACT(YEAR FROM date) AS year,
    COUNT(*) AS total_distributed_vaccines
FROM "DistributedVaccines"
GROUP BY year;

-- Total registered pet owners
CREATE OR REPLACE VIEW "TotalRegisteredPetOwners" AS
SELECT COUNT(*) AS total_registered_pet_owner
FROM "PetOwnerProfiles";

-- Total vaccinated cats and dogs
CREATE OR REPLACE VIEW "TotalVaccinatedCatsAndDogs" AS
SELECT
    specie,
    COUNT(*) AS total_vaccinated
FROM "PetRecords"
WHERE date_vaccinated IS NOT NULL
    AND specie IN ('cat', 'dog')
GROUP BY specie;

-- Total monthly vaccinated pets
CREATE OR REPLACE VIEW "TotalMonthlyVaccinatedPets" AS
SELECT
    EXTRACT(MONTH FROM date_vaccinated) AS month,
    COUNT(*) AS total_vaccinated
FROM "PetRecords"
WHERE date_vaccinated IS NOT NULL
GROUP BY month;

-- Total vaccinated pets per barangay
CREATE OR REPLACE VIEW "TotalVaccinatedPetsPerBarangay" AS
SELECT
    p.barangay,
    COUNT(*) AS total_vaccinated
FROM "PetRecords" r
JOIN "PetOwnerProfiles" p ON r.owner_id = p.id
WHERE r.date_vaccinated IS NOT NULL
GROUP BY p.barangay;

-- Total registered pet owners per barangay
CREATE OR REPLACE VIEW "TotalRegisteredPetOwnersPerBarangay" AS
SELECT
    barangay,
    COUNT(*) AS total_registered_pet_owners
FROM "PetOwnerProfiles"
GROUP BY barangay;

-- ==========================================
-- RPC Function: get_pet_counts
-- Returns count of pets per owner
-- ==========================================

CREATE OR REPLACE FUNCTION get_pet_counts()
RETURNS TABLE(owner_id uuid, pet_count bigint)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT owner_id, COUNT(*) AS pet_count
    FROM "PetRecords"
    GROUP BY owner_id;
$$;

-- ==========================================
-- RLS Policies
-- Enable Row Level Security on all tables
-- with permissive policies for authenticated users
-- ==========================================

-- PetOwnerProfiles
ALTER TABLE public."PetOwnerProfiles" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access on PetOwnerProfiles"
    ON public."PetOwnerProfiles"
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- PersonnelProfiles
ALTER TABLE public."PersonnelProfiles" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access on PersonnelProfiles"
    ON public."PersonnelProfiles"
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- PetRecords
ALTER TABLE public."PetRecords" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access on PetRecords"
    ON public."PetRecords"
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- VaccineInventory
ALTER TABLE public."VaccineInventory" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access on VaccineInventory"
    ON public."VaccineInventory"
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- VaccinationSchedule
ALTER TABLE public."VaccinationSchedule" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access on VaccinationSchedule"
    ON public."VaccinationSchedule"
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- VaccinationRecords
ALTER TABLE public."VaccinationRecords" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access on VaccinationRecords"
    ON public."VaccinationRecords"
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- AppointmentRecords
ALTER TABLE public."AppointmentRecords" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access on AppointmentRecords"
    ON public."AppointmentRecords"
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- DistributedVaccines
ALTER TABLE public."DistributedVaccines" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access on DistributedVaccines"
    ON public."DistributedVaccines"
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- AdminNotifications
ALTER TABLE public."AdminNotifications" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access on AdminNotifications"
    ON public."AdminNotifications"
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
