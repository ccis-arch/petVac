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
    const supabaseAdmin = getAdminClient();

    // First check if an auth user with this email already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email === email
    );

    if (existingUser) {
      // Check if this orphaned auth user has a profile row
      const { data: existingProfile } = await supabaseAdmin
        .from("PetOwnerProfiles")
        .select("id")
        .eq("id", existingUser.id)
        .maybeSingle();

      if (existingProfile) {
        // User genuinely already exists with a profile
        return NextResponse.json(
          { error: "A user with this email address has already been registered." },
          { status: 400 }
        );
      }

      // Orphaned auth user (no profile) - delete it so we can re-create
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
    }

    // Create the auth user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const user = data?.user;

    if (!user) {
      return NextResponse.json({ error: "User creation failed" }, { status: 500 });
    }

    // Format date fields properly for date columns
    const profileToInsert: Record<string, any> = {
      id: user.id,
      email: profile.email,
      password: profile.password,
      first_name: profile.first_name,
      last_name: profile.last_name,
      gender: profile.gender,
      barangay: profile.barangay,
      phone_number: profile.phone_number,
      birth_date: profile.birth_date || null,
      date_registered: new Date().toISOString().split("T")[0],
    };

    const { data: profileData, error: insertError } = await supabaseAdmin
      .from("PetOwnerProfiles")
      .insert(profileToInsert);

    if (insertError) {
      // Clean up the auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ profileData, userID: user.id });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
