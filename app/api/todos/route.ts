import { NextResponse } from "next/server";
import { getGlobalTodos, saveGlobalTodos } from "@/lib/store";

export async function GET() {
  const todos = getGlobalTodos();
  return NextResponse.json({ todos });
}

export async function PUT(request: Request) {
  const body = await request.json();
  saveGlobalTodos(body);
  return NextResponse.json({ todos: body });
}
