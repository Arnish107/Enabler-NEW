"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mic,
  Hand,
  MessagesSquare,
  Video,
  ShieldAlert,
  Bell,
  Sparkles,
  History,
  Settings,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/speech", label: "Speech", icon: Mic },
  { href: "/app/sign", label: "Sign", icon: Hand },
  { href: "/app/conversation", label: "Conversation", icon: MessagesSquare },
  { href: "/app/video", label: "Video", icon: Video },
  { href: "/app/emergency", label: "Emergency", icon: ShieldAlert },
  { href: "/app/alerts", label: "Sound Alerts", icon: Bell },
  { href: "/app/assistant", label: "AI Assistant", icon: Sparkles },
  { href: "/app/history", label: "History", icon: History },
  { href: "/app/settings", label: "Settings", icon: Settings },
  { href: "/app/help", label: "Help", icon: HelpCircle },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Logo href="/app" />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="App">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/app" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <p className="text-xs text-muted-foreground">
          Secure Gemini-powered processing
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-card/80 backdrop-blur-xl lg:block">
        {content}
      </aside>
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:hidden">
        <Logo href="/app" />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-background/95 pb-[calc(4.5rem+env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
          <div className="absolute right-4 top-[max(0.75rem,env(safe-area-inset-top))]">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="h-full overflow-y-auto pt-12">{content}</div>
        </div>
      )}
    </>
  );
}
