import { NextRequest, NextResponse } from "next/server";
import { setPassword, removePassword, verifySession, hasPassword, verifyPassword, isPasswordUsedByOther } from "@/lib/auth";
import type { UserId } from "@/lib/types";

// Set or update password
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    const body = await request.json();
    const { userId, newPassword, currentPassword } = body as {
      userId: UserId;
      newPassword: string;
      currentPassword?: string;
    };

    if (!userId || (userId !== "user1" && userId !== "user2")) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json({ error: "密码至少需要4位" }, { status: 400 });
    }

    // Check if password is already used by the other user
    if (isPasswordUsedByOther(userId, newPassword)) {
      return NextResponse.json({ error: "此密码已被使用，请设置不同的密码" }, { status: 400 });
    }

    // If password already exists, verify current password
    if (hasPassword(userId)) {
      // Need either valid session or correct current password
      const sessionValid = token && verifySession(token).valid && verifySession(token).userId === userId;
      const passwordValid = currentPassword && verifyPassword(userId, currentPassword);

      if (!sessionValid && !passwordValid) {
        return NextResponse.json({ error: "需要验证当前密码" }, { status: 401 });
      }
    }

    setPassword(userId, newPassword);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to set password" }, { status: 500 });
  }
}

// Remove password
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    const body = await request.json();
    const { userId, currentPassword } = body as { userId: UserId; currentPassword: string };

    if (!userId || (userId !== "user1" && userId !== "user2")) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Verify authorization
    if (hasPassword(userId)) {
      const sessionValid = token && verifySession(token).valid && verifySession(token).userId === userId;
      const passwordValid = currentPassword && verifyPassword(userId, currentPassword);

      if (!sessionValid && !passwordValid) {
        return NextResponse.json({ error: "需要验证当前密码" }, { status: 401 });
      }
    }

    removePassword(userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove password" }, { status: 500 });
  }
}

// Check password status for users
export async function GET() {
  return NextResponse.json({
    user1: hasPassword("user1"),
    user2: hasPassword("user2"),
  });
}
