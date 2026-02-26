-- ============================================
-- Fix RLS policies: Allow anonymous read access
-- for landing page and public-facing features
-- ============================================

-- VaccinationSchedule: Allow anonymous read (for landing page schedule viewer)
CREATE POLICY "Allow anon read on VaccinationSchedule"
    ON public."VaccinationSchedule"
    FOR SELECT
    TO anon
    USING (true);

-- PetOwnerProfiles: Allow anon read (for overview and registration checks)
CREATE POLICY "Allow anon read on PetOwnerProfiles"
    ON public."PetOwnerProfiles"
    FOR SELECT
    TO anon
    USING (true);

-- PetRecords: Allow anon read (for overview stats)
CREATE POLICY "Allow anon read on PetRecords"
    ON public."PetRecords"
    FOR SELECT
    TO anon
    USING (true);

-- VaccinationRecords: Allow anon read (for overview stats)
CREATE POLICY "Allow anon read on VaccinationRecords"
    ON public."VaccinationRecords"
    FOR SELECT
    TO anon
    USING (true);

-- DistributedVaccines: Allow anon read (for overview stats)
CREATE POLICY "Allow anon read on DistributedVaccines"
    ON public."DistributedVaccines"
    FOR SELECT
    TO anon
    USING (true);

-- VaccineInventory: Allow anon read (for overview stats - joined via VaccinationRecords)
CREATE POLICY "Allow anon read on VaccineInventory"
    ON public."VaccineInventory"
    FOR SELECT
    TO anon
    USING (true);

-- AdminNotifications: Allow anon insert (for registration notifications from landing page)
CREATE POLICY "Allow anon insert on AdminNotifications"
    ON public."AdminNotifications"
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- AdminNotifications: Allow anon read (not strictly needed but prevents errors)
CREATE POLICY "Allow anon read on AdminNotifications"
    ON public."AdminNotifications"
    FOR SELECT
    TO anon
    USING (true);

-- PersonnelProfiles: Allow anon read (for sign-in role check)
CREATE POLICY "Allow anon read on PersonnelProfiles"
    ON public."PersonnelProfiles"
    FOR SELECT
    TO anon
    USING (true);

-- AppointmentRecords: Allow anon read (for overview/reporting)
CREATE POLICY "Allow anon read on AppointmentRecords"
    ON public."AppointmentRecords"
    FOR SELECT
    TO anon
    USING (true);
