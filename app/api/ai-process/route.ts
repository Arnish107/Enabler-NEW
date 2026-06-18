import { NextRequest, NextResponse } from "next/server";
import { processWithAI } from "@/lib/ai-process";
import type { AiTask } from "@/lib/types";

const VALID_TASKS: AiTask[] = [
  "enhance-transcript",
  "clean-text",
  "map-gestures",
  "improve-translation",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, task, context } = body as {
      text?: string;
      task?: AiTask;
      context?: Record<string, unknown>;
    };

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Missing text", message: "Provide text to process." },
        { status: 400 },
      );
    }

    if (!task || !VALID_TASKS.includes(task)) {
      return NextResponse.json(
        {
          error: "Invalid task",
          message: `Task must be one of: ${VALID_TASKS.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const result = await processWithAI(text.trim(), task, context);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "AI processing failed", message: "Could not process request." },
      { status: 500 },
    );
  }
}
