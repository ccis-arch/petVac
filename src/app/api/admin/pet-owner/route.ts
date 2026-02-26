import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getAdminClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase configuration");
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, profile } = await request.json();
    console.log("[v0] pet-owner POST - email:", email);

    const supabaseAdmin = getAdminClient();

    // Try to create the auth user
    let { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    // If user already exists, check if it's an orphan (no profile row)
    if (error && error.message?.includes("already been registered")) {
      console.log("[v0] User exists, checking for orphan...");

      // Find existing user by listing and filtering by email
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers({
        perPage: 1000,
      });
      const existingUser = listData?.users?.find((u) => u.email === email);

      if (existingUser) {
        // Check if profile exists
        const { data: existingProfile } = await supabaseAdmin
          .from("PetOwnerProfiles")
          .select("id")
          .eq("id", existingUser.id)
          .maybeSingle();

        if (!existingProfile) {
          // Orphan - delete the old auth user and retry
          console.log("[v0] Orphan found, deleting user:", existingUser.id);
          await supabaseAdmin.auth.admin.deleteUser(existingUser.id);

          // Retry creation
          const retryResult = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });
          data = retryResult.data;
          error = retryResult.error;
        } else {
          // User genuinely exists with a profile
          return NextResponse.json(
            { error: "A pet owner with this email already exists. Please use a different email or login." },
            { status: 400 }
          );
        }
      }
    }

    if (error) {
      console.log("[v0] Auth error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const user = data?.user;
    if (!user) {
      return NextResponse.json({ error: "User creation failed" }, { status: 500 });
    }

    console.log("[v0] Auth user created:", user.id);

    // Build profile with only valid columns
    const profileToInsert: Record<string, any> = {
      id: user.id,
      email: profile.email || email,
      password: profile.password || password,
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      gender: profile.gender || "",
      barangay: profile.barangay || "",
      phone_number: profile.phone_number || "",
      birth_date: profile.birth_date || null,
      date_registered: new Date().toISOString().split("T")[0],
    };

    console.log("[v0] Inserting profile:", JSON.stringify(profileToInsert));

    const { data: profileData, error: insertError } = await supabaseAdmin
      .from("PetOwnerProfiles")
      .insert(profileToInsert);

    if (insertError) {
      console.log("[v0] Profile insert error:", insertError.message, insertError.details, insertError.hint);
      // Clean up auth user on failure
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      return NextResponse.json(
        { error: "Profile creation failed: " + insertError.message },
        { status: 400 }
      );
    }

    console.log("[v0] Registration complete for:", email);
    return NextResponse.json({ profileData, userID: user.id });
  } catch (error: any) {
    console.log("[v0] Unexpected error:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
