"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mic,
  Hand,
  MessagesSquare,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/app", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/app/speech", label: "Speech", icon: Mic },
  { href: "/app/sign", label: "Sign", icon: Hand },
  { href: "/app/conversation", label: "Live", icon: MessagesSquare },
  { href: "/app/help", label: "More", icon: Menu },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden"
      aria-label="Mobile"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-1">
        {tabs.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[11px] font-medium transition",
                  active
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground active:bg-muted",
                )}
                aria-current={active ? "page" : undefined}
              >
                <tab.icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
