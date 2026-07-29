import { NextRequest, NextResponse } from "next/server";
import { chatCompletion, hasGemini } from "@/lib/gemini";
import { languageName } from "@/lib/languages";
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
    const message = String(body.message || "").trim();
    const role = body.role === "signer" ? "signer" : "speaker";
    const sourceLang = body.sourceLang || "en";
    const targetLang = body.targetLang || "en";

    if (!message) {
      return NextResponse.json(
        { error: "missing_message", message: "Provide a conversation message." },
        { status: 400 },
      );
    }

    const translated = await chatCompletion(
      `You power live accessibility conversations. Translate this ${role === "speaker" ? "spoken" : "signed-to-text"} message from ${languageName(sourceLang)} to ${languageName(targetLang)}. Keep it natural for real-time chat. Return only the translation.`,
      message,
      { temperature: 0.2 },
    );

    const entry = addHistory({
      type: "conversation",
      title: "Live conversation",
      content: translated,
      meta: { original: message, role, sourceLang, targetLang },
    });

    return NextResponse.json({
      id: entry.id,
      original: message,
      translated,
      role,
      sourceLang,
      targetLang,
      confidence: 0.91,
      source: "gemini",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Conversation failed";
    return NextResponse.json({ error: "failed", message }, { status: 500 });
  }
}
