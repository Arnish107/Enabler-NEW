import { AppSidebar } from "@/components/app-sidebar";
import { AppPageTransition } from "@/components/app-page-transition";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="gradient-mesh pointer-events-none fixed inset-0 opacity-70" />
      <AppSidebar />
      <div className="relative lg:pl-64">
        <header className="sticky top-0 z-30 hidden h-16 items-center justify-end border-b border-border/60 bg-background/70 px-6 backdrop-blur-xl lg:flex">
          <ThemeToggle />
        </header>
        <main
          id="main"
          className="px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-[calc(4.5rem+env(safe-area-inset-top))] lg:px-8 lg:pb-16 lg:pt-8"
        >
          <AppPageTransition>{children}</AppPageTransition>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
