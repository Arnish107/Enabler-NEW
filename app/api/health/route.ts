import { NextResponse } from "next/server";
import { hasOpenAI } from "@/lib/openai";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "enabler-api",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    capabilities: {
      speechToText: true,
      signToText: true,
      translate: true,
      aiProcess: true,
      openaiEnabled: hasOpenAI(),
    },
    endpoints: [
      "POST /api/speech-to-text",
      "POST /api/sign-to-text",
      "POST /api/translate",
      "POST /api/ai-process",
      "GET /api/health",
    ],
  });
}
