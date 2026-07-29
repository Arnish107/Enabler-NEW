import { NextRequest, NextResponse } from "next/server";
import { chatCompletion, hasGemini } from "@/lib/gemini";
import { processSignFrames } from "@/lib/sign-classifier";
import { addHistory } from "@/lib/history-store";
import type { FrameInput } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const frames = body.frames as FrameInput[] | undefined;

    if (!frames?.length) {
      return NextResponse.json(
        {
          error: "missing_frames",
          message: "Provide MediaPipe hand landmark frames.",
        },
        { status: 400 },
      );
    }

    const classified = processSignFrames(frames);
    let text = classified.text;

    if (hasGemini() && classified.gestures.length > 0) {
      const words = classified.gestures.map((g) => g.word).join(", ");
      const enhanced = await chatCompletion(
        "You convert detected ASL gesture words into one natural, grammatical English sentence for an accessibility app. Return only the sentence.",
        `Gesture words: ${words}`,
        { temperature: 0.2 },
      );
      if (enhanced) text = enhanced;
    }

    addHistory({
      type: "sign-text",
      title: "Sign → Text",
      content: text,
      meta: {
        confidence: classified.confidence,
        gestures: classified.gestures,
      },
    });

    return NextResponse.json({
      text,
      confidence: classified.confidence,
      gestures: classified.gestures,
      pipeline: classified.pipeline,
      source: hasGemini() ? "mediapipe+gemini" : "mediapipe",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Sign processing failed";
    return NextResponse.json({ error: "failed", message }, { status: 500 });
  }
}
