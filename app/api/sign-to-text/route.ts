import { NextRequest, NextResponse } from "next/server";
import { processSignFrames } from "@/lib/sign-to-text";
import { processWithAI } from "@/lib/ai-process";
import type { FrameInput } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { frames, enhance = true } = body as {
      frames: FrameInput[];
      enhance?: boolean;
    };

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return NextResponse.json(
        {
          error: "Missing frames",
          message:
            "Provide an array of video frames with hand landmarks from MediaPipe.",
        },
        { status: 400 },
      );
    }

    const validFrames = frames.filter(
      (f) => f.landmarks && Array.isArray(f.landmarks) && f.landmarks.length >= 21,
    );

    if (validFrames.length === 0) {
      return NextResponse.json(
        {
          error: "No hand data",
          message:
            "No valid hand landmarks detected. Ensure hands are visible in the video.",
          text: "No recognizable signs detected. Please ensure your hands are visible to the camera.",
          confidence: 0,
          gestures: [],
          pipeline: [
            { id: "input", label: "Video input received", status: "complete" },
            {
              id: "frames",
              label: "Frame extraction",
              status: "complete",
              detail: `${frames.length} frames, 0 with hands`,
            },
            {
              id: "tracking",
              label: "Hand landmark tracking",
              status: "error",
              detail: "No hands detected",
            },
          ],
          source: "gesture-classifier",
        },
        { status: 200 },
      );
    }

    const result = processSignFrames(validFrames);

    if (enhance && result.gestures.length > 0) {
      const gestureWords = result.gestures.map((g) => g.word).filter(Boolean);
      const enhanced = await processWithAI(
        result.text,
        "map-gestures",
        { gestures: gestureWords },
      );
      result.text = enhanced.result;
      result.confidence = Math.max(result.confidence, enhanced.confidence);
      result.pipeline.push({
        id: "ai-enhance",
        label: "AI sentence assembly",
        status: "complete",
        detail: enhanced.source,
      });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Processing failed", message: "Could not process sign input." },
      { status: 500 },
    );
  }
}
