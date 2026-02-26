-- Add anon delete/update/insert policies for tables that need them from client-side
-- These are needed because authenticated users on the anon client perform these ops

-- Allow authenticated users to insert into all tables
CREATE POLICY IF NOT EXISTS "Authenticated insert PetOwnerProfiles" ON "PetOwnerProfiles" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated insert PetRecords" ON "PetRecords" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated insert VaccineInventory" ON "VaccineInventory" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated insert VaccinationSchedule" ON "VaccinationSchedule" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated insert VaccinationRecords" ON "VaccinationRecords" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated insert AppointmentRecords" ON "AppointmentRecords" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated insert DistributedVaccines" ON "DistributedVaccines" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated insert AdminNotifications" ON "AdminNotifications" FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update all tables
CREATE POLICY IF NOT EXISTS "Authenticated update PetOwnerProfiles" ON "PetOwnerProfiles" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated update PetRecords" ON "PetRecords" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated update VaccineInventory" ON "VaccineInventory" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated update VaccinationSchedule" ON "VaccinationSchedule" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated update AppointmentRecords" ON "AppointmentRecords" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated update DistributedVaccines" ON "DistributedVaccines" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Allow authenticated users to delete from all tables
CREATE POLICY IF NOT EXISTS "Authenticated delete PetOwnerProfiles" ON "PetOwnerProfiles" FOR DELETE TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated delete PetRecords" ON "PetRecords" FOR DELETE TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated delete VaccineInventory" ON "VaccineInventory" FOR DELETE TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated delete VaccinationSchedule" ON "VaccinationSchedule" FOR DELETE TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated delete AppointmentRecords" ON "AppointmentRecords" FOR DELETE TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated delete DistributedVaccines" ON "DistributedVaccines" FOR DELETE TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated delete AdminNotifications" ON "AdminNotifications" FOR DELETE TO authenticated USING (true);

-- Allow anon insert for AppointmentRecords (pet owners book before being fully authed)
CREATE POLICY IF NOT EXISTS "Anon insert AppointmentRecords" ON "AppointmentRecords" FOR INSERT TO anon WITH CHECK (true);
