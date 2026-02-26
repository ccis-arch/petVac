import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, profile } = await request.json();
    console.log("[v0] personnel POST called, email:", email, "profile:", JSON.stringify(profile));
    const supabaseAdmin = getAdminClient();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.log("[v0] Personnel auth create error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const user = data?.user;
    console.log("[v0] Personnel auth user created, id:", user?.id);

    if (user) {
      const { data: profileData, error: insertError } = await supabaseAdmin
        .from("PersonnelProfiles")
        .insert({
          id: user.id,
          ...profile,
        });

      if (insertError) {
        console.log("[v0] Personnel profile insert error:", insertError.message, insertError.details, insertError.hint);
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
