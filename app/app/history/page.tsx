"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { HistoryItem } from "@/lib/types";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setError("Could not load history");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function clear() {
    await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clear" }),
    });
    setItems([]);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">History</h1>
          <p className="mt-2 text-muted-foreground">
            Recent translations and AI sessions from this deployment.
          </p>
        </div>
        <Button variant="secondary" onClick={clear}>
          Clear
        </Button>
      </div>
      <div className="space-y-3">
        {items.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No history yet. Use Speech, Sign, or Conversation to create entries.
            </CardContent>
          </Card>
        )}
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
              <CardTitle className="text-base">{item.title}</CardTitle>
              <Badge variant="outline">{item.type}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{item.content}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
