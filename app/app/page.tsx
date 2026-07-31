"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mic,
  Hand,
  MessagesSquare,
  Video,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const tools = [
  { href: "/app/speech", title: "Speech → Sign", desc: "Speak and get animated sign gloss", icon: Mic },
  { href: "/app/sign", title: "Sign → Text", desc: "Camera-based recognition", icon: Hand },
  { href: "/app/conversation", title: "Live Conversation", desc: "Split-screen translation", icon: MessagesSquare },
  { href: "/app/video", title: "Video Translation", desc: "Upload and transcribe", icon: Video },
  { href: "/app/emergency", title: "Emergency", desc: "Critical message cards", icon: ShieldAlert },
  { href: "/app/assistant", title: "AI Assistant", desc: "Simplify & suggest", icon: Sparkles },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Welcome back
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Accessibility Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Choose a tool to start communicating. All AI runs securely via Google Gemini.
        </p>
      </motion.div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.href}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={tool.href} className="group block h-full">
              <Card className="h-full transition duration-300 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-glow">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{tool.title}</CardTitle>
                  <CardDescription>{tool.desc}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
