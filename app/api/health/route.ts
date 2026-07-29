import { NextRequest, NextResponse } from "next/server";
import { hasOpenAI } from "@/lib/openai";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "enabler",
    version: "3.0.0",
    timestamp: new Date().toISOString(),
    openai: hasOpenAI(),
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
