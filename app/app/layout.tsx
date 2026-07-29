import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-mesh pointer-events-none fixed inset-0 opacity-70" />
      <AppSidebar />
      <div className="relative lg:pl-64">
        <header className="sticky top-0 z-30 hidden h-16 items-center justify-end border-b border-border/60 bg-background/70 px-6 backdrop-blur-xl lg:flex">
          <ThemeToggle />
        </header>
        <main id="main" className="px-4 pb-16 pt-20 lg:px-8 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
