import { NextRequest, NextResponse } from "next/server";
import { translateText } from "@/lib/translate";
import { processWithAI } from "@/lib/ai-process";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      direction = "speech-to-sign",
      sourceLang = "en",
      targetLang = "asl",
      enhance = false,
    } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Missing text", message: "Provide text to translate." },
        { status: 400 },
      );
    }

    const result = translateText(
      text.trim(),
      direction,
      sourceLang,
      targetLang,
    );

    if (enhance && direction === "text-to-text") {
      const enhanced = await processWithAI(text.trim(), "improve-translation", {
        sourceLang,
        targetLang,
        direction,
      });
      result.translatedText = enhanced.result;
      result.confidence = Math.max(result.confidence, enhanced.confidence);
      result.pipeline.push({
        id: "ai-enhance",
        label: "AI translation enhancement",
        status: "complete",
        detail: enhanced.source,
      });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Translation failed", message: "Could not translate text." },
      { status: 500 },
    );
  }
}
