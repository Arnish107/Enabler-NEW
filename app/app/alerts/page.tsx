"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ALERTS = [
  { key: "doorbell", label: "Doorbell", desc: "Someone at the door", icon: "🔔" },
  { key: "fire", label: "Fire Alarm", desc: "Smoke or fire alarm", icon: "🔥" },
  { key: "phone", label: "Phone", desc: "Incoming phone call", icon: "📱" },
  { key: "baby", label: "Baby Crying", desc: "Infant distress sounds", icon: "👶" },
  { key: "horn", label: "Car Horn", desc: "Traffic warning", icon: "🚗" },
  { key: "alarm", label: "Alarm", desc: "Clock or appliance alarm", icon: "⏰" },
] as const;

export default function AlertsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    doorbell: true,
    fire: true,
    phone: true,
    baby: false,
    horn: false,
    alarm: true,
  });
  const [log, setLog] = useState<string[]>([]);

  function simulate(key: string, label: string) {
    if (!enabled[key]) return;
    setLog((l) => [`${new Date().toLocaleTimeString()} · ${label} detected`, ...l].slice(0, 12));
    if (navigator.vibrate) navigator.vibrate(key === "fire" ? [200, 100, 200] : 150);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Sound Alerts</h1>
        <p className="mt-2 text-muted-foreground">
          Visual and haptic notifications for important environmental sounds.
          Ready for future on-device audio recognition.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {ALERTS.map((alert) => (
          <Card key={alert.key}>
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  {alert.icon}
                </div>
                <div>
                  <p className="font-semibold">{alert.label}</p>
                  <p className="text-sm text-muted-foreground">{alert.desc}</p>
                </div>
              </div>
              <Switch
                checked={!!enabled[alert.key]}
                onCheckedChange={(v) =>
                  setEnabled((s) => ({ ...s, [alert.key]: v }))
                }
                aria-label={`Toggle ${alert.label}`}
              />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent alerts</CardTitle>
          <Badge variant="success">Monitoring</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {ALERTS.slice(0, 3).map((a) => (
              <Button
                key={a.key}
                size="sm"
                variant="secondary"
                onClick={() => simulate(a.key, a.label)}
              >
                Test {a.label}
              </Button>
            ))}
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {log.length === 0 && <li>No alerts yet. Enable types and run a test.</li>}
            {log.map((item) => (
              <li key={item} className="rounded-lg border border-border px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
