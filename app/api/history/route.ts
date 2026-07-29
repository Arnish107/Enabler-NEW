import { NextRequest, NextResponse } from "next/server";
import { addHistory, clearHistory, listHistory } from "@/lib/history-store";

export async function GET() {
  return NextResponse.json({ items: listHistory() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === "clear") {
      clearHistory();
      return NextResponse.json({ ok: true, items: [] });
    }

    if (!body.title || !body.content || !body.type) {
      return NextResponse.json(
        { error: "missing_fields", message: "Provide type, title, and content." },
        { status: 400 },
      );
    }

    const item = addHistory({
      type: body.type,
      title: body.title,
      content: body.content,
      meta: body.meta,
    });

    return NextResponse.json({ item });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "History update failed";
    return NextResponse.json({ error: "failed", message }, { status: 500 });
  }
}
