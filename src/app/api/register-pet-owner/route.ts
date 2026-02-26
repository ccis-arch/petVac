import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, profile } = body;

    console.log("[v0] API /register-pet-owner called with email:", email);
    console.log("[v0] Profile received:", JSON.stringify(profile));

    if (!email || !password) {
      console.log("[v0] Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("[v0] SUPABASE_URL exists:", !!supabaseUrl);
    console.log("[v0] SERVICE_ROLE_KEY exists:", !!supabaseServiceRoleKey);

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("[v0] Missing Supabase environment variables for admin client.");
      return NextResponse.json(
        { error: "Server configuration error. Missing Supabase credentials." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if a profile with this email already exists in PetOwnerProfiles
    const { data: existingProfile } = await supabaseAdmin
      .from("PetOwnerProfiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      console.log("[v0] Profile already exists for email:", email);
      return NextResponse.json(
        { error: "A user with this email address has already been registered." },
        { status: 400 }
      );
    }

    // Try to create the auth user
    console.log("[v0] Creating auth user for:", email);
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.error("[v0] Auth createUser error:", error.message);

      // If user already exists in auth but not in profiles, delete the orphan and retry
      if (error.message.includes("already been registered") || error.message.includes("already exists")) {
        console.log("[v0] Attempting to clean up orphaned auth user for:", email);

        // Find the existing auth user by listing with a filter
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const orphanedUser = listData?.users?.find((u) => u.email === email);

        if (orphanedUser) {
          console.log("[v0] Found orphaned auth user:", orphanedUser.id, "- deleting");
          await supabaseAdmin.auth.admin.deleteUser(orphanedUser.id);

          // Retry creating the user
          const { data: retryData, error: retryError } =
            await supabaseAdmin.auth.admin.createUser({
              email,
              password,
              email_confirm: true,
            });

          if (retryError) {
            console.error("[v0] Retry createUser error:", retryError.message);
            return NextResponse.json(
              { error: retryError.message },
              { status: 400 }
            );
          }

          if (!retryData?.user) {
            return NextResponse.json(
              { error: "Failed to create user after cleanup." },
              { status: 500 }
            );
          }

          // Use the retried user
          return await insertProfile(supabaseAdmin, retryData.user, email, password, profile);
        }
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const user = data?.user;

    if (!user) {
      return NextResponse.json(
        { error: "Failed to create user." },
        { status: 500 }
      );
    }

    return await insertProfile(supabaseAdmin, user, email, password, profile);
  } catch (err: any) {
    console.error("[v0] Register pet owner unexpected error:", err);
    return NextResponse.json(
      { error: err?.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

async function insertProfile(
  supabaseAdmin: any,
  user: any,
  email: string,
  password: string,
  profile: any
) {
  console.log("[v0] Auth user created/found:", user.id);

  // Build a clean profile object matching the PetOwnerProfiles columns
  const cleanProfile: Record<string, any> = {
    id: user.id,
    email: email,
    password: password,
    last_name: profile?.last_name || "",
    first_name: profile?.first_name || "",
    phone_number: profile?.phone_number || "",
    gender: profile?.gender || null,
    barangay: profile?.barangay || null,
    birth_date: profile?.birth_date || null,
  };

  // Only include date_registered if we have one, otherwise let DB default handle it
  if (profile?.date_registered) {
    cleanProfile.date_registered = new Date(profile.date_registered)
      .toISOString()
      .split("T")[0];
  }

  console.log("[v0] Inserting profile:", JSON.stringify(cleanProfile));

  const { error: insertError } = await supabaseAdmin
    .from("PetOwnerProfiles")
    .insert(cleanProfile);

  if (insertError) {
    console.error(
      "[v0] Profile insert error:",
      insertError.message,
      insertError.details,
      insertError.hint,
      insertError.code
    );
    // If profile insertion fails, clean up the auth user
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  console.log("[v0] Registration successful for user:", user.id);
  return NextResponse.json(
    { success: true, userID: user.id },
    { status: 200 }
  );
}
