import gestureDictionary from "./data/gesture-dictionary.json";
import type { GestureResult, Landmark } from "./types";

const GESTURES = gestureDictionary.gestures as Record<
  string,
  { label: string; primaryWord: string; emoji: string }
>;

function distance(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function classifyGesture(landmarks: Landmark[]): GestureResult {
  if (!landmarks || landmarks.length < 21) {
    return {
      gesture: "unknown",
      confidence: 0,
      label: "unknown",
      word: "",
    };
  }

  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  const fingerTips = [indexTip, middleTip, ringTip, pinkyTip];

  const allExtended = fingerTips.every((tip) => distance(tip, wrist) > 0.14);
  const allCurled = fingerTips.every((tip) => distance(tip, wrist) < 0.11);
  const indexExtended = distance(indexTip, wrist) > 0.15;
  const othersCurled = [middleTip, ringTip, pinkyTip].every(
    (tip) => distance(tip, wrist) < 0.13,
  );
  const thumbAbove = thumbTip.y < wrist.y - 0.06;
  const thumbBelow = thumbTip.y > wrist.y + 0.06;
  const spread =
    Math.max(...fingerTips.map((t) => t.x)) -
    Math.min(...fingerTips.map((t) => t.x));

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

export function dedupeGestures(gestures: GestureResult[]): GestureResult[] {
  const result: GestureResult[] = [];
  for (const g of gestures) {
    if (g.gesture === "unknown") continue;
    const last = result[result.length - 1];
    if (!last || last.gesture !== g.gesture) {
      result.push(g);
    }
  }
  return result;
}

export function gesturesToSentence(gestures: GestureResult[]): string {
  const unique = dedupeGestures(gestures);
  if (!unique.length) {
    return "No recognizable signs detected. Please ensure your hands are visible to the camera.";
  }

  const words = unique.map((g) => {
    const meta = GESTURES[g.gesture];
    return meta?.primaryWord ?? g.word;
  });

  const sentence = words
    .map((w, i) => (i === 0 ? capitalize(w) : w))
    .join(" ");

  return sentence.endsWith(".") ? sentence : sentence + ".";
}

export function averageConfidence(gestures: GestureResult[]): number {
  const valid = gestures.filter((g) => g.gesture !== "unknown");
  if (!valid.length) return 0;
  const sum = valid.reduce((acc, g) => acc + g.confidence, 0);
  return Math.round((sum / valid.length) * 100) / 100;
}

function capitalize(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}
