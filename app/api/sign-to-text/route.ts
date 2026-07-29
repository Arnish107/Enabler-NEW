import { NextRequest, NextResponse } from "next/server";
import { chatCompletion, hasGemini } from "@/lib/gemini";
import { processSignFrames } from "@/lib/sign-classifier";
import { addHistory } from "@/lib/history-store";
import type { FrameInput } from "@/lib/types";

const EMPTY_TEXT =
  "No recognizable signs detected. Please ensure your hands are clearly visible and well lit.";

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

    const validFrames = frames.filter((f) => f.landmarks?.length >= 21);
    if (!validFrames.length) {
      return NextResponse.json(
        {
          error: "no_hands",
          message:
            "No valid hand landmarks found. Re-record with hands clearly in frame.",
          text: EMPTY_TEXT,
          confidence: 0,
          gestures: [],
        },
        { status: 422 },
      );
    }

    const classified = processSignFrames(validFrames);
    let text = classified.text;

    if (
      hasGemini() &&
      classified.gestures.length > 0 &&
      classified.confidence >= 0.5
    ) {
      const gestureLines = classified.gestures
        .map(
          (g) =>
            `- ${g.word} (${g.label}, confidence ${Math.round(g.confidence * 100)}%)`,
        )
        .join("\n");
      const enhanced = await chatCompletion(
        [
          "You convert a short sequence of detected ASL-style gesture words into one natural, grammatical English sentence.",
          "Use ONLY the provided gesture words as meaning; do not invent extra topics.",
          "Preserve order. Keep the sentence short and clear for an accessibility app.",
          "Return only the sentence — no quotes, labels, or explanation.",
        ].join(" "),
        `Detected gestures in order:\n${gestureLines}\n\nFallback sentence: ${classified.text}`,
        { temperature: 0.15 },
      );
      if (enhanced?.trim()) {
        const cleaned = enhanced.trim().replace(/^["']|["']$/g, "");
        // Reject hallucinated long answers that ignore the gestures
        if (cleaned.split(/\s+/).length <= 24) {
          text = cleaned;
        }
      }
    }

    // Never dress up empty detections as a successful translation
    if (!classified.gestures.length) {
      text = EMPTY_TEXT;
    }

    addHistory({
      type: "sign-text",
      title: "Sign → Text",
      content: text,
      meta: {
        confidence: classified.confidence,
        gestures: classified.gestures,
        frameCount: validFrames.length,
      },
    });

    return NextResponse.json({
      text,
      confidence: classified.confidence,
      gestures: classified.gestures,
      pipeline: classified.pipeline,
      frameCount: validFrames.length,
      source: hasGemini() ? "mediapipe+gemini" : "mediapipe",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Sign processing failed";
    return NextResponse.json({ error: "failed", message }, { status: 500 });
  }
}
