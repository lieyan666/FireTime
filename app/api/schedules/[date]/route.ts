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
  const userSchedule = data[userId]?.schedule || [];
  return NextResponse.json({ schedule: userSchedule });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  const body = await request.json();
  const { userId, schedule } = body as { userId: UserId; schedule: unknown };

  if (!userId || !schedule) {
    return NextResponse.json(
      { error: "Missing userId or schedule" },
      { status: 400 }
    );
  }

  const data = getDayData(date);
  data[userId].schedule = schedule as typeof data.user1.schedule;
  saveDayData(data);

  return NextResponse.json({ schedule: data[userId].schedule });
}
