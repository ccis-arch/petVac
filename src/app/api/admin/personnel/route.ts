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

    // Check if an auth user with this email already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email === email
    );

    if (existingUser) {
      // Check if this orphaned auth user has a profile row
      const { data: existingProfile } = await supabaseAdmin
        .from("PersonnelProfiles")
        .select("id")
        .eq("id", existingUser.id)
        .maybeSingle();

      if (existingProfile) {
        return NextResponse.json(
          { error: "A user with this email address has already been registered." },
          { status: 400 }
        );
      }

      // Orphaned auth user (no profile) - delete it so we can re-create
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
    }

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

    // Explicitly map profile fields to match PersonnelProfiles columns
    const profileToInsert: Record<string, any> = {
      id: user.id,
      email: profile.email,
      password: profile.password,
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone_number: profile.phone_number,
      address: profile.address,
    };

    const { data: profileData, error: insertError } = await supabaseAdmin
      .from("PersonnelProfiles")
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

export async function PUT(request: NextRequest) {
  try {
    const { id, updatedRecord } = await request.json();
    const supabaseAdmin = getAdminClient();

    const { data: user, error } = await supabaseAdmin.auth.admin.updateUserById(
      id,
      {
        email: updatedRecord.email,
        password: updatedRecord.password,
      }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (user) {
      const { data, error: updateError } = await supabaseAdmin
        .from("PersonnelProfiles")
        .update(updatedRecord)
        .eq("id", id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 400 }
        );
      }

      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: "User update failed" }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const supabaseAdmin = getAdminClient();

    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
