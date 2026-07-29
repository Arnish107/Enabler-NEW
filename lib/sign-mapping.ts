import signMapping from "@/lib/data/sign-mapping.json";

const MAPPING = signMapping as Record<
  string,
  { gesture: string; emoji: string; label: string }
>;

export type SignSequenceItem = {
  word: string;
  gesture: string;
  emoji: string;
  label: string;
};

export function mapTextToSigns(text: string): SignSequenceItem[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  return words.map((word) => {
    const clean = word.replace(/[^a-z]/g, "");
    const entry = MAPPING[clean] ?? MAPPING.default;
    return {
      word: clean,
      gesture: entry.gesture,
      emoji: entry.emoji,
      label: entry.label,
    };
  });
}
