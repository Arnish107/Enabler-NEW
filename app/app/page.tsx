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
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Accessibility Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Choose a tool to start communicating. All AI runs securely via Google Gemini.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.href}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={tool.href} className="group block h-full">
              <Card className="h-full transition duration-300 active:scale-[0.99] group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-glow">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4 sm:flex-col sm:items-start sm:gap-0 sm:space-y-1.5 sm:p-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:mb-2 sm:h-10 sm:w-10">
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">{tool.title}</CardTitle>
                    <CardDescription className="mt-1">{tool.desc}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
