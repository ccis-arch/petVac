import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createServerSupabaseAdmin } from "./supabase-server";

export type UserRole = "admin" | "personnel" | "pet-owner";

export interface AuthResult {
  user: any;
  role: UserRole;
}

function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

export async function getAuthenticatedUser(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }

  const supabase = createServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const supabaseAdmin = createServerSupabaseAdmin();

  // Check if personnel
  const { data: personnelData } = await supabaseAdmin
    .from("PersonnelProfiles")
    .select("id")
    .eq("id", userId);

  if (personnelData && personnelData.length > 0) {
    return "personnel";
  }

  // Check if pet owner
  const { data: petOwnerData } = await supabaseAdmin
    .from("PetOwnerProfiles")
    .select("id")
    .eq("id", userId);

  if (petOwnerData && petOwnerData.length > 0) {
    return "pet-owner";
  }

  // If not in either table, they are admin
  return "admin";
}

export async function requireAuth(request: NextRequest): Promise<AuthResult | NextResponse> {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getUserRole(user.id);
  if (!role) {
    return NextResponse.json({ error: "Unable to determine role" }, { status: 403 });
  }

  return { user, role };
}

export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthResult | NextResponse> {
  const result = await requireAuth(request);

  if (result instanceof NextResponse) {
    return result;
  }

  if (!allowedRoles.includes(result.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return result;
}

export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
