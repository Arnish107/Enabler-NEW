import { NextResponse } from "next/server";
import { getModelName, hasGemini } from "@/lib/gemini";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "enabler",
    version: "3.0.0",
    timestamp: new Date().toISOString(),
    gemini: hasGemini(),
    model: getModelName(),
    // Presence only — never returns the secret value
    env: {
      GEMINI_API_KEY: Boolean(process.env.GEMINI_API_KEY?.trim()),
      GOOGLE_GENERATIVE_AI_API_KEY: Boolean(
        process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim(),
      ),
      GOOGLE_API_KEY: Boolean(process.env.GOOGLE_API_KEY?.trim()),
    },
    endpoints: [
      "GET /api/health",
      "POST /api/speech-to-text",
      "POST /api/sign-to-text",
      "POST /api/translate",
      "POST /api/ai-process",
      "POST /api/conversation",
      "GET|POST /api/history",
    ],
  });
}
