import gestureDictionary from "@/lib/data/gesture-dictionary.json";
import type { FrameInput, GestureResult, PipelineStep } from "@/lib/types";

const GESTURES = gestureDictionary.gestures as Record<
  string,
  { label: string; primaryWord: string }
>;

const MIN_GESTURE_CONFIDENCE = 0.55;

function distance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/** Tip extended when tip is farther from wrist than the PIP joint. */
function fingerExtended(
  wrist: { x: number; y: number },
  tip: { x: number; y: number },
  pip: { x: number; y: number },
): boolean {
  return distance(tip, wrist) > distance(pip, wrist) * 1.12;
}

function fingerCurled(
  wrist: { x: number; y: number },
  tip: { x: number; y: number },
  mcp: { x: number; y: number },
): boolean {
  return distance(tip, wrist) < distance(mcp, wrist) * 1.15;
}

export function classifyGesture(
  landmarks: { x: number; y: number; z?: number }[],
): GestureResult {
  if (!landmarks || landmarks.length < 21) {
    return { gesture: "unknown", confidence: 0, label: "unknown", word: "" };
  }

  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const indexTip = landmarks[8];
  const indexPip = landmarks[6];
  const indexMcp = landmarks[5];
  const middleTip = landmarks[12];
  const middlePip = landmarks[10];
  const middleMcp = landmarks[9];
  const ringTip = landmarks[16];
  const ringPip = landmarks[14];
  const ringMcp = landmarks[13];
  const pinkyTip = landmarks[20];
  const pinkyPip = landmarks[18];
  const pinkyMcp = landmarks[17];

  const indexUp = fingerExtended(wrist, indexTip, indexPip);
  const middleUp = fingerExtended(wrist, middleTip, middlePip);
  const ringUp = fingerExtended(wrist, ringTip, ringPip);
  const pinkyUp = fingerExtended(wrist, pinkyTip, pinkyPip);

  const indexDown = fingerCurled(wrist, indexTip, indexMcp);
  const middleDown = fingerCurled(wrist, middleTip, middleMcp);
  const ringDown = fingerCurled(wrist, ringTip, ringMcp);
  const pinkyDown = fingerCurled(wrist, pinkyTip, pinkyMcp);

  const allExtended = indexUp && middleUp && ringUp && pinkyUp;
  const allCurled = indexDown && middleDown && ringDown && pinkyDown;
  const othersCurled = middleDown && ringDown && pinkyDown;

  // Thumb relative to IP / wrist (y increases downward in MediaPipe image space)
  const thumbAbove = thumbTip.y < thumbIp.y - 0.02 && thumbTip.y < wrist.y - 0.04;
  const thumbBelow = thumbTip.y > thumbIp.y + 0.02 && thumbTip.y > wrist.y + 0.04;
  const tips = [indexTip, middleTip, ringTip, pinkyTip];
  const spread =
    Math.max(...tips.map((t) => t.x)) - Math.min(...tips.map((t) => t.x));

  let gesture = "unknown";
  let confidence = 0.3;

  if (thumbAbove && allCurled) {
    gesture = "thumbs_up";
    confidence = 0.9;
  } else if (thumbBelow && allCurled) {
    gesture = "thumbs_down";
    confidence = 0.88;
  } else if (indexUp && othersCurled && !middleUp) {
    gesture = "point";
    confidence = 0.86;
  } else if (allExtended && spread > 0.16) {
    gesture = "hand_wave";
    confidence = 0.84;
  } else if (allExtended && spread > 0.1) {
    gesture = "open_palm";
    confidence = 0.82;
  } else if (allCurled && !thumbAbove && !thumbBelow) {
    gesture = "fist";
    confidence = 0.8;
  } else if (wrist.y < 0.38 && allExtended) {
    gesture = "hand_raise";
    confidence = 0.76;
  }

  const meta = GESTURES[gesture];
  return {
    gesture,
    confidence,
    label: meta?.label ?? "unknown",
    word: meta?.primaryWord ?? "",
  };
}

/**
 * Collapse consecutive duplicate gestures and require a minimum run length
 * so brief misclassifications don't become words.
 */
function stabilizeGestures(gestures: GestureResult[]): GestureResult[] {
  if (!gestures.length) return [];

  type Run = { gesture: GestureResult; count: number; sumConf: number };
  const runs: Run[] = [];

  for (const g of gestures) {
    const last = runs[runs.length - 1];
    if (last && last.gesture.gesture === g.gesture) {
      last.count += 1;
      last.sumConf += g.confidence;
      if (g.confidence > last.gesture.confidence) last.gesture = g;
    } else {
      runs.push({ gesture: g, count: 1, sumConf: g.confidence });
    }
  }

  const unique: GestureResult[] = [];
  for (const run of runs) {
    // Single-frame detections only keep if high confidence; short runs of 2+ always keep
    if (run.count === 1 && run.gesture.confidence < 0.8) continue;
    unique.push({
      ...run.gesture,
      confidence: Math.round((run.sumConf / run.count) * 100) / 100,
    });
  }

  // If everything was filtered, keep the highest-confidence run
  if (!unique.length && runs.length) {
    const best = runs.reduce((a, b) =>
      a.sumConf / a.count >= b.sumConf / b.count ? a : b,
    );
    unique.push({
      ...best.gesture,
      confidence: Math.round((best.sumConf / best.count) * 100) / 100,
    });
  }

  return unique;
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

  const raw = frames
    .filter((f) => f.landmarks?.length >= 21)
    .map((f) => classifyGesture(f.landmarks))
    .filter(
      (g) =>
        g.gesture !== "unknown" && g.confidence >= MIN_GESTURE_CONFIDENCE,
    );

  const unique = stabilizeGestures(raw);

  const words = unique.map((g) => g.word).filter(Boolean);
  const text =
    words.length > 0
      ? words.map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(" ") +
        "."
      : "No recognizable signs detected. Please ensure your hands are clearly visible and well lit.";

  const confidence =
    unique.length > 0
      ? Math.round(
          (unique.reduce((a, g) => a + g.confidence, 0) / unique.length) * 100,
        ) / 100
      : 0;

  return { text, confidence, gestures: unique, pipeline };
}
