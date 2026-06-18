import signMapping from "./data/sign-mapping.json";
import type { PipelineStep, SignSequenceItem, TranslateResponse } from "./types";

const MAPPING = signMapping as Record<
  string,
  { gesture: string; emoji: string; label: string }
>;

const TRANSLATION_PAIRS: Record<string, Record<string, string>> = {
  "en-es": {
    hello: "hola",
    help: "ayuda",
    yes: "sí",
    no: "no",
    thank: "gracias",
    please: "por favor",
    stop: "alto",
    you: "tú",
    medical: "médico",
    emergency: "emergencia",
  },
  "en-fr": {
    hello: "bonjour",
    help: "aide",
    yes: "oui",
    no: "non",
    thank: "merci",
    please: "s'il vous plaît",
    stop: "arrêt",
    you: "vous",
    medical: "médical",
    emergency: "urgence",
  },
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function mapWordToSign(word: string): SignSequenceItem {
  const clean = word.replace(/[^a-z]/g, "");
  const entry = MAPPING[clean] ?? MAPPING.default;
  return {
    word: clean,
    gesture: entry.gesture,
    emoji: entry.emoji,
    label: entry.label,
  };
}

function translateWords(words: string[], pairKey: string): string {
  const dict = TRANSLATION_PAIRS[pairKey];
  if (!dict) return words.join(" ");

  return words
    .map((w) => dict[w.replace(/[^a-z]/g, "")] ?? w)
    .join(" ");
}

export function translateText(
  text: string,
  direction: string,
  sourceLang = "en",
  targetLang = "asl",
): TranslateResponse {
  const pipeline: PipelineStep[] = [
    { id: "input", label: "Text received", status: "complete" },
    { id: "tokenize", label: "Tokenization", status: "active" },
    { id: "mapping", label: "Sign mapping engine", status: "pending" },
    { id: "output", label: "Response generation", status: "pending" },
  ];

  const words = tokenize(text);
  pipeline[1] = {
    ...pipeline[1],
    status: "complete",
    detail: `${words.length} tokens`,
  };

  let translatedText = text;
  let signSequence: SignSequenceItem[] = [];

  if (direction === "speech-to-sign" || direction === "text-to-sign") {
    signSequence = words.map(mapWordToSign);
    translatedText = signSequence.map((s) => s.label).join(" → ");
    pipeline[2] = {
      ...pipeline[2],
      status: "complete",
      detail: `${signSequence.length} signs mapped`,
    };
  } else if (direction === "text-to-text") {
    const pairKey = `${sourceLang}-${targetLang}`;
    translatedText = translateWords(words, pairKey);
    pipeline[2] = {
      ...pipeline[2],
      status: "complete",
      detail: `Translated ${sourceLang} → ${targetLang}`,
    };
  } else {
    signSequence = words.map(mapWordToSign);
    translatedText = words.join(" ");
    pipeline[2] = {
      ...pipeline[2],
      status: "complete",
      detail: "Sign tokens decoded",
    };
  }

  pipeline[3] = { ...pipeline[3], status: "complete" };

  const mappedCount = signSequence.filter((s) => MAPPING[s.word]).length;
  const confidence =
    words.length > 0
      ? Math.round(((mappedCount / words.length) * 0.4 + 0.55) * 100) / 100
      : 0.5;

  return {
    originalText: text,
    translatedText,
    signSequence,
    confidence,
    pipeline,
    direction,
  };
}
