import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Help</h1>
        <p className="mt-2 text-muted-foreground">
          Quick guidance for using Enabler.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>1. Add your Gemini API key to `.env.local` as `GEMINI_API_KEY`.</p>
          <p>2. Open Speech to capture voice, or Sign to use the camera.</p>
          <p>3. Use Live Conversation for two-way translation.</p>
          <p>4. Emergency cards work offline for urgent messaging.</p>
          <p>5. History stores recent sessions for this server instance.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Keyboard navigation, skip links, ARIA labels, and theme contrast controls are built in.</p>
          <p>Prefer Chrome or Edge for Web Speech API support.</p>
        </CardContent>
      </Card>
    </div>
  );
}
