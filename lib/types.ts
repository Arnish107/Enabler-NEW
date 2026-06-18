export interface Landmark {
  x: number;
  y: number;
  z?: number;
}

export interface FrameInput {
  landmarks: Landmark[];
  timestamp?: number;
}

export interface GestureResult {
  gesture: string;
  confidence: number;
  label: string;
  word: string;
}

export interface PipelineStep {
  id: string;
  label: string;
  status: "pending" | "active" | "complete" | "error";
  detail?: string;
}

export interface SignToTextResponse {
  text: string;
  confidence: number;
  gestures: GestureResult[];
  pipeline: PipelineStep[];
  source: "gesture-classifier";
}

export interface SpeechToTextResponse {
  transcript: string;
  confidence: number;
  language: string;
  pipeline: PipelineStep[];
  source: "web-speech" | "audio-processing";
}

export interface SignSequenceItem {
  word: string;
  gesture: string;
  emoji: string;
  label: string;
}

export interface TranslateResponse {
  originalText: string;
  translatedText: string;
  signSequence: SignSequenceItem[];
  confidence: number;
  pipeline: PipelineStep[];
  direction: string;
}

export type AiTask =
  | "enhance-transcript"
  | "clean-text"
  | "map-gestures"
  | "improve-translation";

export interface AiProcessContext {
  gestures?: string[];
  sourceLang?: string;
  targetLang?: string;
  direction?: string;
}

export interface AiProcessResponse {
  result: string;
  confidence: number;
  source: "openai" | "structured-fallback";
  task: AiTask;
  pipeline: PipelineStep[];
}
