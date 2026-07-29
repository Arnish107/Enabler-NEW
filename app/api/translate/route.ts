import { NextRequest, NextResponse } from "next/server";
import { chatCompletion, hasOpenAI } from "@/lib/openai";
import { languageName } from "@/lib/languages";
import { mapTextToSigns } from "@/lib/sign-mapping";

export async function POST(request: NextRequest) {
  try {
    if (!hasOpenAI()) {
      return NextResponse.json(
        {
          error: "missing_key",
          message: "OPENAI_API_KEY is not configured.",
        },
        { status: 503 },
      );
    }

    const body = await request.json();
    const text = String(body.text || "").trim();
    const sourceLang = body.sourceLang || "en";
    const targetLang = body.targetLang || "es";
    const direction = body.direction || "text-to-text";

    if (!text) {
      return NextResponse.json(
        { error: "missing_text", message: "Provide text to translate." },
        { status: 400 },
      );
    }

    if (direction === "speech-to-sign" || direction === "text-to-sign") {
      const signs = mapTextToSigns(text);
      const gloss = await chatCompletion(
        "You convert English into ASL gloss notation (uppercase keywords, simplified grammar). Return only the gloss sequence separated by spaces.",
        text,
        { temperature: 0.2 },
      );

      return NextResponse.json({
        originalText: text,
        translatedText: gloss || signs.map((s) => s.label).join(" → "),
        signs,
        direction,
        confidence: 0.9,
        source: "openai",
      });
    }

    const translated = await chatCompletion(
      `You are a professional translator for an accessibility platform. Translate from ${languageName(sourceLang)} to ${languageName(targetLang)}. Return only the translation.`,
      text,
      { temperature: 0.2 },
    );

    return NextResponse.json({
      originalText: text,
      translatedText: translated,
      direction: "text-to-text",
      sourceLang,
      targetLang,
      confidence: 0.93,
      source: "openai",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Translation failed";
    return NextResponse.json({ error: "failed", message }, { status: 500 });
  }
}
