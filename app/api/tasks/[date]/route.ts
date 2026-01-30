import { NextResponse } from "next/server";
import { getDayData, saveDayData } from "@/lib/store";
import type { UserId } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") as UserId || "user1";

  const data = getDayData(date);
  const tasks = data[userId]?.tasks || [];
  return NextResponse.json({ tasks });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  const body = await request.json();
  const { userId, tasks } = body as { userId: UserId; tasks: unknown };

  if (!userId || !tasks) {
    return NextResponse.json(
      { error: "Missing userId or tasks" },
      { status: 400 }
    );
  }

  const data = getDayData(date);
  data[userId].tasks = tasks as typeof data.user1.tasks;
  saveDayData(data);

  return NextResponse.json({ tasks: data[userId].tasks });
}
