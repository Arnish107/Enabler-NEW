import {
  averageConfidence,
  classifyGesture,
  gesturesToSentence,
} from "./sign-classifier";
import type { FrameInput, PipelineStep, SignToTextResponse } from "./types";

export function processSignFrames(frames: FrameInput[]): SignToTextResponse {
  const pipeline: PipelineStep[] = [
    { id: "input", label: "Video input received", status: "complete" },
    {
      id: "frames",
      label: "Frame extraction",
      status: "complete",
      detail: `${frames.length} frames analyzed`,
    },
    { id: "tracking", label: "Hand landmark tracking", status: "active" },
    { id: "classification", label: "Gesture classification", status: "pending" },
    { id: "language", label: "Language model assembly", status: "pending" },
  ];

  const gestures = frames
    .filter((f) => f.landmarks?.length >= 21)
    .map((f) => classifyGesture(f.landmarks));

  pipeline[2] = {
    ...pipeline[2],
    status: "complete",
    detail: `${gestures.length} hand poses tracked`,
  };
  pipeline[3] = { ...pipeline[3], status: "complete" };
  pipeline[4] = { ...pipeline[4], status: "active" };

  const text = gesturesToSentence(gestures);
  const confidence = averageConfidence(gestures);

  pipeline[4] = {
    ...pipeline[4],
    status: "complete",
    detail: `Confidence: ${Math.round(confidence * 100)}%`,
  };

  return {
    text,
    confidence,
    gestures: gestures.filter((g) => g.gesture !== "unknown"),
    pipeline,
    source: "gesture-classifier",
  };
}
