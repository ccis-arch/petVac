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
    console.log("[v0] pet-owner POST called, email:", email, "profile keys:", Object.keys(profile || {}));
    const supabaseAdmin = getAdminClient();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.log("[v0] Auth create error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const user = data?.user;
    console.log("[v0] Auth user created, id:", user?.id);

    if (user) {
      // Format date_registered to ISO date string for the date column
      const profileToInsert = {
        id: user.id,
        ...profile,
        date_registered: profile.date_registered 
          ? new Date(profile.date_registered).toISOString().split("T")[0] 
          : new Date().toISOString().split("T")[0],
      };

      const { data: profileData, error: insertError } = await supabaseAdmin
        .from("PetOwnerProfiles")
        .insert(profileToInsert);

      if (insertError) {
        console.log("[v0] Profile insert error:", insertError.message, insertError.details, insertError.hint);
        // Clean up the auth user if profile insert fails
        await supabaseAdmin.auth.admin.deleteUser(user.id);
        return NextResponse.json(
          { error: insertError.message },
          { status: 400 }
        );
      }

      return NextResponse.json({ profileData, userID: user.id });
    }

    return NextResponse.json({ error: "User creation failed" }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
