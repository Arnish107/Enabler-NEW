import { GoogleGenerativeAI } from "@google/generative-ai";

/** gemini-2.0-flash is shut down / free-tier limit 0 — use 2.5+ */
const DEFAULT_MODEL = "gemini-2.5-flash";

function getModelName(): string {
  const fromEnv = process.env.GEMINI_MODEL?.trim();
  if (fromEnv) return fromEnv;
  return DEFAULT_MODEL;
}

function getApiKey(): string | null {
  const raw =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    "";
  const key = raw.trim();
  if (!key || key.includes("YOUR_GEMINI") || key.includes("PASTE_YOUR")) {
    return null;
  }
  return key;
}

function formatGeminiError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("429") || message.includes("quota") || message.includes("RESOURCE_EXHAUSTED")) {
    return new Error(
      `Gemini quota exceeded for model "${getModelName()}". Wait and retry, switch GEMINI_MODEL (e.g. gemini-2.5-flash-lite), or enable billing in Google AI Studio. Original: ${message}`,
    );
  }
  return error instanceof Error ? error : new Error(message);
}

export function getGeminiClient(): GoogleGenerativeAI | null {
  const key = getApiKey();
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

export function hasGemini(): boolean {
  return Boolean(getApiKey());
}

/** @deprecated Use hasGemini */
export function hasOpenAI(): boolean {
  return hasGemini();
}

export async function chatCompletion(
  system: string,
  user: string,
  options?: { temperature?: number; json?: boolean },
): Promise<string> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const model = client.getGenerativeModel({
      model: getModelName(),
      systemInstruction: system,
      generationConfig: {
        temperature: options?.temperature ?? 0.3,
        responseMimeType: options?.json ? "application/json" : "text/plain",
      },
    });

    const result = await model.generateContent(user);
    return result.response.text().trim();
  } catch (error) {
    throw formatGeminiError(error);
  }
}

export async function transcribeAudio(
  buffer: Buffer,
  filename = "audio.webm",
): Promise<string> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const ext = filename.split(".").pop()?.toLowerCase() || "webm";
  const mimeType =
    ext === "mp3"
      ? "audio/mpeg"
      : ext === "wav"
        ? "audio/wav"
        : ext === "m4a"
          ? "audio/mp4"
          : "audio/webm";

  try {
    const model = client.getGenerativeModel({ model: getModelName() });
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: buffer.toString("base64"),
        },
      },
      {
        text: "Transcribe this audio accurately. Return only the transcript text with no commentary.",
      },
    ]);

    return result.response.text().trim();
  } catch (error) {
    throw formatGeminiError(error);
  }
}
