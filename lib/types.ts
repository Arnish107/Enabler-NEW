export type Landmark = { x: number; y: number; z?: number };

export type FrameInput = {
  landmarks: Landmark[];
  timestamp?: number;
};

export type GestureResult = {
  gesture: string;
  confidence: number;
  label: string;
  word: string;
};

export type PipelineStep = {
  id: string;
  label: string;
  status: "pending" | "active" | "complete" | "error";
  detail?: string;
};

export type HistoryItem = {
  id: string;
  type: "speech-sign" | "sign-text" | "conversation" | "video" | "ai";
  title: string;
  content: string;
  meta?: Record<string, unknown>;
  createdAt: string;
};

export type ApiError = {
  error: string;
  message: string;
};
