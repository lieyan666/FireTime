import { NextResponse } from "next/server";
import { getAllDayDates, getDayData } from "@/lib/store";

export async function GET() {
  const dates = getAllDayDates();
  const data = dates.map((date) => getDayData(date));
  return NextResponse.json({ data });
}
