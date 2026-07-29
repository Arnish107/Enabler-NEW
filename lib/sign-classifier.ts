import gestureDictionary from "@/lib/data/gesture-dictionary.json";
import type { FrameInput, GestureResult, PipelineStep } from "@/lib/types";

const GESTURES = gestureDictionary.gestures as Record<
  string,
  { label: string; primaryWord: string; emoji: string }
>;

function distance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function classifyGesture(
  landmarks: { x: number; y: number; z?: number }[],
): GestureResult {
  if (!landmarks || landmarks.length < 21) {
    return { gesture: "unknown", confidence: 0, label: "unknown", word: "" };
  }

  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  const tips = [indexTip, middleTip, ringTip, pinkyTip];

  const allExtended = tips.every((t) => distance(t, wrist) > 0.14);
  const allCurled = tips.every((t) => distance(t, wrist) < 0.11);
  const indexExtended = distance(indexTip, wrist) > 0.15;
  const othersCurled = [middleTip, ringTip, pinkyTip].every(
    (t) => distance(t, wrist) < 0.13,
  );
  const thumbAbove = thumbTip.y < wrist.y - 0.06;
  const thumbBelow = thumbTip.y > wrist.y + 0.06;
  const spread =
    Math.max(...tips.map((t) => t.x)) - Math.min(...tips.map((t) => t.x));

  let gesture = "unknown";
  let confidence = 0.3;

  if (thumbAbove && allCurled) {
    gesture = "thumbs_up";
    confidence = 0.87;
  } else if (thumbBelow && allCurled) {
    gesture = "thumbs_down";
    confidence = 0.84;
  } else if (indexExtended && othersCurled) {
    gesture = "point";
    confidence = 0.82;
  } else if (allExtended && spread > 0.14) {
    gesture = "hand_wave";
    confidence = 0.85;
  } else if (allExtended) {
    gesture = "open_palm";
    confidence = 0.83;
  } else if (allCurled) {
    gesture = "fist";
    confidence = 0.81;
  } else if (wrist.y < 0.42 && allExtended) {
    gesture = "hand_raise";
    confidence = 0.78;
  }

  const meta = GESTURES[gesture];
  return {
    gesture,
    confidence,
    label: meta?.label ?? "unknown",
    word: meta?.primaryWord ?? "",
  };
}

export function processSignFrames(frames: FrameInput[]) {
  const pipeline: PipelineStep[] = [
    { id: "input", label: "Video input received", status: "complete" },
    {
      id: "frames",
      label: "Frame extraction",
      status: "complete",
      detail: `${frames.length} frames`,
    },
    { id: "tracking", label: "Hand landmark tracking", status: "complete" },
    { id: "classification", label: "Gesture classification", status: "complete" },
    { id: "language", label: "Sentence assembly", status: "complete" },
  ];

  const gestures = frames
    .filter((f) => f.landmarks?.length >= 21)
    .map((f) => classifyGesture(f.landmarks))
    .filter((g) => g.gesture !== "unknown");

  const unique: GestureResult[] = [];
  for (const g of gestures) {
    if (!unique.length || unique[unique.length - 1].gesture !== g.gesture) {
      unique.push(g);
    }
  }

  const words = unique.map((g) => g.word).filter(Boolean);
  const text =
    words.length > 0
      ? words.map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(" ") +
        "."
      : "No recognizable signs detected. Please ensure your hands are visible to the camera.";

  const confidence =
    unique.length > 0
      ? Math.round(
          (unique.reduce((a, g) => a + g.confidence, 0) / unique.length) * 100,
        ) / 100
      : 0;

  return { text, confidence, gestures: unique, pipeline };
}
