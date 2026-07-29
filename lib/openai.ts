import OpenAI from "openai";
import { toFile } from "openai";

export function getOpenAIClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.includes("YOUR_OPENAI") || key.includes("PASTE_YOUR")) {
    return null;
  }
  return new OpenAI({ apiKey: key });
}

export function hasOpenAI(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return Boolean(
    key && !key.includes("YOUR_OPENAI") && !key.includes("PASTE_YOUR"),
  );
}

export async function chatCompletion(
  system: string,
  user: string,
  options?: { temperature?: number; json?: boolean },
): Promise<string> {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: options?.temperature ?? 0.3,
    response_format: options?.json ? { type: "json_object" } : undefined,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}

export async function transcribeAudio(
  buffer: Buffer,
  filename = "audio.webm",
): Promise<string> {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const file = await toFile(buffer, filename);
  const result = await client.audio.transcriptions.create({
    file,
    model: "whisper-1",
  });

  return result.text.trim();
}
