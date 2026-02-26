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
    const supabaseAdmin = getAdminClient();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const user = data?.user;

    if (user) {
      const { data: profileData, error: insertError } = await supabaseAdmin
        .from("PetOwnerProfiles")
        .insert({
          id: user.id,
          ...profile,
        });

      if (insertError) {
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
