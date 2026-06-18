import { translateText } from "./translate";
import { callChatCompletion, hasOpenAI } from "./openai";
import type {
  AiProcessContext,
  AiProcessResponse,
  AiTask,
  PipelineStep,
} from "./types";

function cleanText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .replace(/([.!?])([^\s])/g, "$1 $2");
}

function capitalizeSentence(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function structuredFallback(
  text: string,
  task: AiTask,
  context?: AiProcessContext,
): AiProcessResponse {
  const pipeline: PipelineStep[] = [
    { id: "input", label: "Input received", status: "complete" },
    {
      id: "engine",
      label: "Structured fallback processor",
      status: "active",
    },
    { id: "output", label: "Response generation", status: "pending" },
  ];

  let result = text;

  switch (task) {
    case "enhance-transcript":
    case "clean-text":
      result = capitalizeSentence(cleanText(text));
      if (!result.endsWith(".") && !result.endsWith("?") && !result.endsWith("!")) {
        result += ".";
      }
      break;
    case "map-gestures":
      if (context?.gestures?.length) {
        result = context.gestures
          .map((g, i) => (i === 0 ? capitalizeSentence(g) : g))
          .join(" ");
        if (!result.endsWith(".")) result += ".";
      } else {
        result = capitalizeSentence(cleanText(text));
      }
      break;
    case "improve-translation": {
      const translated = translateText(
        text,
        context?.direction ?? "text-to-text",
        context?.sourceLang ?? "en",
        context?.targetLang ?? "es",
      );
      result = translated.translatedText;
      break;
    }
    default:
      result = cleanText(text);
  }

  pipeline[1] = {
    ...pipeline[1],
    status: "complete",
    detail: "Deterministic rules applied",
  };
  pipeline[2] = { ...pipeline[2], status: "complete" };

  return {
    result,
    confidence: 0.78,
    source: "structured-fallback",
    task,
    pipeline,
  };
}

function buildPrompt(task: AiTask, text: string, context?: AiProcessContext): string {
  switch (task) {
    case "enhance-transcript":
      return `You are an accessibility speech-to-text assistant. Clean, punctuate, and normalize this transcript. Return ONLY the cleaned transcript with no explanation:\n\n${text}`;
    case "clean-text":
      return `Fix grammar and punctuation for this accessibility app text. Return ONLY the corrected text:\n\n${text}`;
    case "map-gestures":
      return `Convert these detected sign gesture words into one natural English sentence. Return ONLY the sentence:\n\n${context?.gestures?.join(" ") ?? text}`;
    case "improve-translation":
      return `Improve this accessibility translation from ${context?.sourceLang ?? "en"} to ${context?.targetLang ?? "target"}. Return ONLY the improved translation:\n\n${text}`;
    default:
      return text;
  }
}

export async function processWithAI(
  text: string,
  task: AiTask,
  context?: AiProcessContext,
): Promise<AiProcessResponse> {
  const pipeline: PipelineStep[] = [
    { id: "input", label: "Input received", status: "complete" },
    { id: "engine", label: "AI processing", status: "active" },
    { id: "output", label: "Response generation", status: "pending" },
  ];

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || !hasOpenAI()) {
    return structuredFallback(text, task, context);
  }

  try {
    const prompt = buildPrompt(task, text, context);
    const result = await callChatCompletion(prompt, apiKey);

    if (!result) {
      return structuredFallback(text, task, context);
    }

    pipeline[1] = {
      ...pipeline[1],
      status: "complete",
      detail: "OpenAI gpt-4o-mini",
    };
    pipeline[2] = { ...pipeline[2], status: "complete" };

    return {
      result,
      confidence: 0.9,
      source: "openai",
      task,
      pipeline,
    };
  } catch {
    const fallback = structuredFallback(text, task, context);
    fallback.pipeline[1] = {
      ...fallback.pipeline[1],
      detail: "OpenAI unavailable — structured fallback used",
    };
    return fallback;
  }
}
