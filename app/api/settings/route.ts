import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/store";

export async function GET() {
  const settings = getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const body = await request.json();
  saveSettings(body);
  return NextResponse.json({ settings: body });
}
