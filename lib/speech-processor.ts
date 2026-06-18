import type { PipelineStep, SpeechToTextResponse } from "./types";

function cleanTranscript(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/([.!?])\s*$/, "$1");
}

function splitPhrases(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function processSpeechInput(
  transcript: string,
  language = "en-US",
  source: "web-speech" | "audio-processing" = "web-speech",
): SpeechToTextResponse {
  const pipeline: PipelineStep[] = [
    {
      id: "input",
      label: source === "web-speech" ? "Speech captured" : "Audio received",
      status: "complete",
    },
    { id: "stt", label: "Speech-to-text processing", status: "active" },
    { id: "clean", label: "Transcript normalization", status: "pending" },
    { id: "phrases", label: "Phrase segmentation", status: "pending" },
  ];

  const cleaned = cleanTranscript(transcript);
  const phrases = splitPhrases(cleaned || transcript);

  pipeline[1] = {
    ...pipeline[1],
    status: "complete",
    detail: `${cleaned.length} characters recognized`,
  };
  pipeline[2] = { ...pipeline[2], status: "complete" };
  pipeline[3] = {
    ...pipeline[3],
    status: "complete",
    detail: `${phrases.length} phrase(s) identified`,
  };

  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
  const confidence = Math.min(0.95, 0.7 + wordCount * 0.02);

  return {
    transcript: cleaned || transcript,
    confidence: Math.round(confidence * 100) / 100,
    language,
    pipeline,
    source,
  };
}
