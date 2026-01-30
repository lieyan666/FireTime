import { NextResponse } from "next/server";
import { getTemplates, saveTemplates } from "@/lib/store";
import type { ScheduleTemplate } from "@/lib/types";

export async function GET() {
  const templates = getTemplates();
  return NextResponse.json({ templates });
}

export async function POST(request: Request) {
  const body = await request.json();
  const template = body as ScheduleTemplate;

  const templates = getTemplates();

  if (template.isDefault) {
    templates.forEach((t) => (t.isDefault = false));
  }

  templates.push(template);
  saveTemplates(templates);

  return NextResponse.json({ templates });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const updated = body as ScheduleTemplate;

  const templates = getTemplates();
  const index = templates.findIndex((t) => t.id === updated.id);

  if (index === -1) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  if (updated.isDefault) {
    templates.forEach((t) => (t.isDefault = false));
  }

  templates[index] = updated;
  saveTemplates(templates);

  return NextResponse.json({ templates });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  let templates = getTemplates();
  templates = templates.filter((t) => t.id !== id);
  saveTemplates(templates);

  return NextResponse.json({ templates });
}
