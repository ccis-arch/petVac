import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, profile } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Missing Supabase environment variables for admin client.");
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // First check if a user with this email already exists in auth
    const { data: existingUsers, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("[v0] Error listing users:", listError.message);
    }

    const existingUser = existingUsers?.users?.find(
      (u) => u.email === email
    );

    if (existingUser) {
      // Check if this user has a PetOwnerProfiles entry
      const { data: existingProfile } = await supabaseAdmin
        .from("PetOwnerProfiles")
        .select("id")
        .eq("id", existingUser.id)
        .single();

      if (existingProfile) {
        return NextResponse.json(
          { error: "A user with this email address has already been registered." },
          { status: 400 }
        );
      }

      // User exists in auth but has no profile - delete the orphaned auth user so we can recreate
      console.error("[v0] Deleting orphaned auth user:", existingUser.id);
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
    }

    // Create the auth user
    console.error("[v0] Creating auth user for:", email);
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.error("[v0] Auth createUser error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const user = data?.user;

    if (!user) {
      return NextResponse.json(
        { error: "Failed to create user." },
        { status: 500 }
      );
    }

    console.error("[v0] Auth user created:", user.id);

    // Build a clean profile object matching the PetOwnerProfiles columns
    const cleanProfile = {
      id: user.id,
      email: profile.email || email,
      password: profile.password || password,
      last_name: profile.last_name || null,
      first_name: profile.first_name || null,
      phone_number: profile.phone_number || null,
      gender: profile.gender || null,
      barangay: profile.barangay || null,
      birth_date: profile.birth_date || null,
      date_registered: profile.date_registered
        ? new Date(profile.date_registered).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    };

    console.error("[v0] Inserting profile:", JSON.stringify(cleanProfile));

    const { error: insertError } = await supabaseAdmin
      .from("PetOwnerProfiles")
      .insert(cleanProfile);

    if (insertError) {
      console.error("[v0] Profile insert error:", insertError.message, insertError.details, insertError.hint);
      // If profile insertion fails, clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    console.error("[v0] Registration successful for user:", user.id);
    return NextResponse.json(
      { success: true, userID: user.id },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Register pet owner error:", err);
    return NextResponse.json(
      { error: err?.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
