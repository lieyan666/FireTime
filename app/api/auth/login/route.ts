import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createSession, isPasswordEnabled, hasPassword, hashPassword, getAuthData } from "@/lib/auth";
import type { UserId } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body as { password: string };

    // If no password is set for any user, allow access as user1
    if (!isPasswordEnabled()) {
      const token = createSession("user1");
      const response = NextResponse.json({ success: true, userId: "user1" });
      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });
      return response;
    }

    // Try to match password against both users
    const auth = getAuthData();
    const passwordHash = hashPassword(password || "");
    let matchedUser: UserId | null = null;

    // Check user1's password
    if (auth.user1 && auth.user1.passwordHash === passwordHash) {
      matchedUser = "user1";
    }
    // Check user2's password
    else if (auth.user2 && auth.user2.passwordHash === passwordHash) {
      matchedUser = "user2";
    }

    if (!matchedUser) {
      return NextResponse.json({ error: "密码错误" }, { status: 401 });
    }

    // Create session for matched user
    const token = createSession(matchedUser);
    const response = NextResponse.json({ success: true, userId: matchedUser });
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

// GET: Check if password is enabled
export async function GET() {
  const enabled = isPasswordEnabled();
  return NextResponse.json({ passwordEnabled: enabled });
}
