"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Hand,
  Mic,
  MessagesSquare,
  Video,
  ShieldAlert,
  Sparkles,
  History,
  Settings,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Mic,
    title: "Speech → Sign",
    description: "Live microphone transcription mapped to structured sign sequences with AI cleanup.",
    href: "/app/speech",
  },
  {
    icon: Hand,
    title: "Sign → Text",
    description: "MediaPipe hand tracking and gesture classification into readable sentences.",
    href: "/app/sign",
  },
  {
    icon: MessagesSquare,
    title: "Live Translation",
    description: "Split-screen conversations with real-time AI translation across languages.",
    href: "/app/conversation",
  },
  {
    icon: Video,
    title: "Video Translation",
    description: "Upload MP4, MOV, or WEBM and generate accessible transcripts.",
    href: "/app/video",
  },
  {
    icon: ShieldAlert,
    title: "Emergency Cards",
    description: "Large, high-contrast cards for urgent communication in critical moments.",
    href: "/app/emergency",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description: "Context-aware help for simplifying language and suggesting replies.",
    href: "/app/assistant",
  },
  {
    icon: History,
    title: "History",
    description: "Review past translations, conversations, and exports in one place.",
    href: "/app/history",
  },
  {
    icon: Settings,
    title: "Settings",
    description: "Language preferences, theme, and accessibility controls.",
    href: "/app/settings",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="relative overflow-hidden pt-28 md:pt-36">
          <div className="gradient-mesh absolute inset-0" />
          <div className="relative mx-auto max-w-6xl px-4 pb-24 text-center md:px-6">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary"
            >
              AI Accessibility Platform
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-tight text-balance md:text-6xl lg:text-7xl"
            >
              Communication Without Barriers
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg"
            >
              Empowering communication through AI-powered accessibility technology
              for speech, sign language, and live conversations.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Button asChild size="lg">
                <Link href="/app">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/app/speech">Live Demo</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
          <div className="mb-12 max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need to communicate
            </h2>
            <p className="mt-3 text-muted-foreground">
              A complete accessibility suite — designed with premium clarity and
              production-ready AI backends.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={feature.href} className="group block h-full">
                  <Card className="h-full transition duration-300 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-glow">
                    <CardHeader>
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="how" className="border-y border-border bg-muted/40 py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              How it works
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Capture",
                  body: "Speak, sign, or upload video. Enabler listens and watches with browser APIs and MediaPipe.",
                },
                {
                  step: "02",
                  title: "Process",
                  body: "Secure serverless routes call Gemini for transcription, translation, and sentence assembly.",
                },
                {
                  step: "03",
                  title: "Communicate",
                  body: "Get structured sign gloss, clear text, live replies, and exportable history.",
                },
              ].map((item) => (
                <Card key={item.step}>
                  <CardContent className="p-6">
                    <p className="text-xs font-bold tracking-[0.2em] text-primary">
                      {item.step}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-24 text-center md:px-6">
          <h2 className="font-display text-3xl font-bold md:text-5xl">
            Built for real communication
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Open the dashboard and try Speech → Sign, Sign → Text, Live Conversation,
            and Emergency Cards in minutes.
          </p>
          <Button asChild size="xl" className="mt-8">
            <Link href="/app">Open Dashboard</Link>
          </Button>
        </section>

        <footer className="border-t border-border py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row md:px-6">
            <p>© {new Date().getFullYear()} Enabler. All rights reserved.</p>
            <p>Breaking Communication Barriers Through AI</p>
          </div>
        </footer>
      </main>
    </>
  );
}
