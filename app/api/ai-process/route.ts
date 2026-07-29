import { NextRequest, NextResponse } from "next/server";
import { chatCompletion, hasGemini } from "@/lib/gemini";
import { addHistory } from "@/lib/history-store";

export async function POST(request: NextRequest) {
  try {
    if (!hasGemini()) {
      return NextResponse.json(
        {
          error: "missing_key",
          message: "GEMINI_API_KEY is not configured.",
        },
        { status: 503 },
      );
    }

    const body = await request.json();
    const text = String(body.text || "").trim();
    const task = body.task || "assist";
    const context = body.context || {};

    if (!text) {
      return NextResponse.json(
        { error: "missing_text", message: "Provide text to process." },
        { status: 400 },
      );
    }

    const prompts: Record<string, string> = {
      assist:
        "You are Enabler AI, a warm accessibility assistant for deaf and hard-of-hearing users. Be clear, concise, and helpful. Suggest practical communication tips when relevant.",
      simplify:
        "Rewrite the text in clear, simple language suitable for accessibility. Keep meaning. Return only the rewritten text.",
      enhance:
        "Improve clarity and punctuation for an accessibility transcript. Return only the improved text.",
      suggest:
        "Suggest 3 short reply options for this conversation in an accessibility context. Return JSON: {\"suggestions\":[\"...\"]}",
    };

    const system = prompts[task] || prompts.assist;
    const result = await chatCompletion(
      system,
      typeof context === "object"
        ? `${text}\n\nContext: ${JSON.stringify(context)}`
        : text,
      { temperature: 0.4, json: task === "suggest" },
    );

    addHistory({
      type: "ai",
      title: `AI · ${task}`,
      content: result,
      meta: { task, input: text },
    });

    return NextResponse.json({
      result,
      task,
      confidence: 0.9,
      source: "gemini",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI processing failed";
    return NextResponse.json({ error: "failed", message }, { status: 500 });
  }
}
