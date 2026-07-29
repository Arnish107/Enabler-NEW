"use client";

import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LANGUAGES } from "@/lib/languages";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [lang, setLang] = useState("en");
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("contrast-more", highContrast);
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "scroll-behavior",
      reducedMotion ? "auto" : "smooth",
    );
  }, [reducedMotion]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Language, theme, and accessibility preferences.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="pref-lang">Preferred language</Label>
            <select
              id="pref-lang"
              className="mt-2 flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} · {l.native}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark mode</p>
              <p className="text-sm text-muted-foreground">Use dark appearance</p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
              aria-label="Dark mode"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">High contrast</p>
              <p className="text-sm text-muted-foreground">Increase visual contrast</p>
            </div>
            <Switch
              checked={highContrast}
              onCheckedChange={setHighContrast}
              aria-label="High contrast"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Reduced motion</p>
              <p className="text-sm text-muted-foreground">Limit animations</p>
            </div>
            <Switch
              checked={reducedMotion}
              onCheckedChange={setReducedMotion}
              aria-label="Reduced motion"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
