-- Add insert/update/delete policies for authenticated users on all tables
-- Drop existing policies first to avoid conflicts, then recreate

-- PetOwnerProfiles
DROP POLICY IF EXISTS "Authenticated insert PetOwnerProfiles" ON "PetOwnerProfiles";
CREATE POLICY "Authenticated insert PetOwnerProfiles" ON "PetOwnerProfiles" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated update PetOwnerProfiles" ON "PetOwnerProfiles";
CREATE POLICY "Authenticated update PetOwnerProfiles" ON "PetOwnerProfiles" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated delete PetOwnerProfiles" ON "PetOwnerProfiles";
CREATE POLICY "Authenticated delete PetOwnerProfiles" ON "PetOwnerProfiles" FOR DELETE TO authenticated USING (true);

-- PetRecords
DROP POLICY IF EXISTS "Authenticated insert PetRecords" ON "PetRecords";
CREATE POLICY "Authenticated insert PetRecords" ON "PetRecords" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated update PetRecords" ON "PetRecords";
CREATE POLICY "Authenticated update PetRecords" ON "PetRecords" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated delete PetRecords" ON "PetRecords";
CREATE POLICY "Authenticated delete PetRecords" ON "PetRecords" FOR DELETE TO authenticated USING (true);

-- VaccineInventory
DROP POLICY IF EXISTS "Authenticated insert VaccineInventory" ON "VaccineInventory";
CREATE POLICY "Authenticated insert VaccineInventory" ON "VaccineInventory" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated update VaccineInventory" ON "VaccineInventory";
CREATE POLICY "Authenticated update VaccineInventory" ON "VaccineInventory" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated delete VaccineInventory" ON "VaccineInventory";
CREATE POLICY "Authenticated delete VaccineInventory" ON "VaccineInventory" FOR DELETE TO authenticated USING (true);

-- VaccinationSchedule
DROP POLICY IF EXISTS "Authenticated insert VaccinationSchedule" ON "VaccinationSchedule";
CREATE POLICY "Authenticated insert VaccinationSchedule" ON "VaccinationSchedule" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated update VaccinationSchedule" ON "VaccinationSchedule";
CREATE POLICY "Authenticated update VaccinationSchedule" ON "VaccinationSchedule" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated delete VaccinationSchedule" ON "VaccinationSchedule";
CREATE POLICY "Authenticated delete VaccinationSchedule" ON "VaccinationSchedule" FOR DELETE TO authenticated USING (true);

-- VaccinationRecords
DROP POLICY IF EXISTS "Authenticated insert VaccinationRecords" ON "VaccinationRecords";
CREATE POLICY "Authenticated insert VaccinationRecords" ON "VaccinationRecords" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated update VaccinationRecords" ON "VaccinationRecords";
CREATE POLICY "Authenticated update VaccinationRecords" ON "VaccinationRecords" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated delete VaccinationRecords" ON "VaccinationRecords";
CREATE POLICY "Authenticated delete VaccinationRecords" ON "VaccinationRecords" FOR DELETE TO authenticated USING (true);

-- AppointmentRecords
DROP POLICY IF EXISTS "Authenticated insert AppointmentRecords" ON "AppointmentRecords";
CREATE POLICY "Authenticated insert AppointmentRecords" ON "AppointmentRecords" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated update AppointmentRecords" ON "AppointmentRecords";
CREATE POLICY "Authenticated update AppointmentRecords" ON "AppointmentRecords" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated delete AppointmentRecords" ON "AppointmentRecords";
CREATE POLICY "Authenticated delete AppointmentRecords" ON "AppointmentRecords" FOR DELETE TO authenticated USING (true);

-- DistributedVaccines
DROP POLICY IF EXISTS "Authenticated insert DistributedVaccines" ON "DistributedVaccines";
CREATE POLICY "Authenticated insert DistributedVaccines" ON "DistributedVaccines" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated update DistributedVaccines" ON "DistributedVaccines";
CREATE POLICY "Authenticated update DistributedVaccines" ON "DistributedVaccines" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated delete DistributedVaccines" ON "DistributedVaccines";
CREATE POLICY "Authenticated delete DistributedVaccines" ON "DistributedVaccines" FOR DELETE TO authenticated USING (true);

-- AdminNotifications
DROP POLICY IF EXISTS "Authenticated insert AdminNotifications" ON "AdminNotifications";
CREATE POLICY "Authenticated insert AdminNotifications" ON "AdminNotifications" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated update AdminNotifications" ON "AdminNotifications";
CREATE POLICY "Authenticated update AdminNotifications" ON "AdminNotifications" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated delete AdminNotifications" ON "AdminNotifications";
CREATE POLICY "Authenticated delete AdminNotifications" ON "AdminNotifications" FOR DELETE TO authenticated USING (true);

-- PersonnelProfiles
DROP POLICY IF EXISTS "Authenticated insert PersonnelProfiles" ON "PersonnelProfiles";
CREATE POLICY "Authenticated insert PersonnelProfiles" ON "PersonnelProfiles" FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated update PersonnelProfiles" ON "PersonnelProfiles";
CREATE POLICY "Authenticated update PersonnelProfiles" ON "PersonnelProfiles" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated delete PersonnelProfiles" ON "PersonnelProfiles";
CREATE POLICY "Authenticated delete PersonnelProfiles" ON "PersonnelProfiles" FOR DELETE TO authenticated USING (true);

-- Allow anon insert for AppointmentRecords (pet owners booking appointments)
DROP POLICY IF EXISTS "Anon insert AppointmentRecords" ON "AppointmentRecords";
CREATE POLICY "Anon insert AppointmentRecords" ON "AppointmentRecords" FOR INSERT TO anon WITH CHECK (true);
