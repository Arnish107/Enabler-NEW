import type { HistoryItem } from "@/lib/types";
import { randomUUID } from "crypto";

const store = new Map<string, HistoryItem>();

export function addHistory(
  item: Omit<HistoryItem, "id" | "createdAt"> & { id?: string },
): HistoryItem {
  const entry: HistoryItem = {
    id: item.id ?? randomUUID(),
    type: item.type,
    title: item.title,
    content: item.content,
    meta: item.meta,
    createdAt: new Date().toISOString(),
  };
  store.set(entry.id, entry);
  return entry;
}

export function listHistory(limit = 50): HistoryItem[] {
  return Array.from(store.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function clearHistory(): void {
  store.clear();
}
