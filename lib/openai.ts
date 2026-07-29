import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Prefer models open to new Google AI Studio users.
 * gemini-2.0-flash / gemini-2.5-flash are restricted or shut down for many accounts.
 */
const DEFAULT_MODEL = "gemini-3.1-flash-lite";

const FALLBACK_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
] as const;

function isModelUnavailable(message: string): boolean {
  return (
    message.includes("404") ||
    message.includes("no longer available") ||
    message.includes("not found") ||
    message.includes("is not found")
  );
}

export function getModelName(): string {
  const fromEnv = process.env.GEMINI_MODEL?.trim();
  if (fromEnv) return fromEnv;
  return DEFAULT_MODEL;
}

function getModelCandidates(): string[] {
  const preferred = getModelName();
  const rest = FALLBACK_MODELS.filter((m) => m !== preferred);
  return [preferred, ...rest];
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

function formatGeminiError(error: unknown, modelTried: string): Error {
  const message = error instanceof Error ? error.message : String(error);
  if (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("RESOURCE_EXHAUSTED")
  ) {
    return new Error(
      `Gemini quota exceeded for model "${modelTried}". Wait and retry, set GEMINI_MODEL to another model (e.g. gemini-3.5-flash-lite), or enable billing in Google AI Studio. Original: ${message}`,
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

async function withModelFallback<T>(
  run: (modelName: string) => Promise<T>,
): Promise<T> {
  const candidates = getModelCandidates();
  let lastError: unknown;

  for (const modelName of candidates) {
    try {
      return await run(modelName);
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (isModelUnavailable(message)) {
        continue;
      }
      throw formatGeminiError(error, modelName);
    }
  }

  throw formatGeminiError(lastError, candidates.join(" → "));
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

  return withModelFallback(async (modelName) => {
    const model = client.getGenerativeModel({
      model: modelName,
      systemInstruction: system,
      generationConfig: {
        temperature: options?.temperature ?? 0.3,
        responseMimeType: options?.json ? "application/json" : "text/plain",
      },
    });

    const result = await model.generateContent(user);
    return result.response.text().trim();
  });
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

  return withModelFallback(async (modelName) => {
    const model = client.getGenerativeModel({ model: modelName });
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
  });
}
