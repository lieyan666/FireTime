import { NextRequest, NextResponse } from "next/server";
import { verifySession, isPasswordEnabled } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // If password is not enabled, allow access
  if (!isPasswordEnabled()) {
    return NextResponse.json({ authenticated: true, passwordEnabled: false });
  }

  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false, passwordEnabled: true });
  }

  const result = verifySession(token);

  if (!result.valid) {
    return NextResponse.json({ authenticated: false, passwordEnabled: true });
  }

  return NextResponse.json({
    authenticated: true,
    userId: result.userId,
    passwordEnabled: true,
  });
}
