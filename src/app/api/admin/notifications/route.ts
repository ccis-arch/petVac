import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const supabaseAdmin = getAdminClient();

    const response = await supabaseAdmin.from("AdminNotifications").insert(data);

    if (response.error) {
      return NextResponse.json(
        { error: response.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: response.data, status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
