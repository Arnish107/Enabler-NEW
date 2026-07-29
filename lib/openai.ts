import { GoogleGenerativeAI } from "@google/generative-ai";

const TEXT_MODEL = "gemini-2.0-flash";
const AUDIO_MODEL = "gemini-2.0-flash";

function getApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.includes("YOUR_GEMINI") || key.includes("PASTE_YOUR")) {
    return null;
  }
  return key;
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

  const model = client.getGenerativeModel({
    model: TEXT_MODEL,
    systemInstruction: system,
    generationConfig: {
      temperature: options?.temperature ?? 0.3,
      responseMimeType: options?.json ? "application/json" : "text/plain",
    },
  });

  const result = await model.generateContent(user);
  return result.response.text().trim();
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

  const model = client.getGenerativeModel({ model: AUDIO_MODEL });
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
}
