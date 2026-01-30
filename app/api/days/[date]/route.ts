import { NextResponse } from "next/server";
import { getDayData, saveDayData } from "@/lib/store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  const data = getDayData(date);
  return NextResponse.json({ data });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  const body = await request.json();

  const existingData = getDayData(date);
  const updatedData = { ...existingData, ...body, date };

  saveDayData(updatedData);
  return NextResponse.json({ data: updatedData });
}
