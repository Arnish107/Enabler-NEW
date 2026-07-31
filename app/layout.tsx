import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers";
import { SplashScreen } from "@/components/splash-screen";
import "./globals.css";

const geistSans = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://enabler.app",
  ),
  title: {
    default: "Enabler — Breaking Communication Barriers Through AI",
    template: "%s · Enabler",
  },
  description:
    "AI-powered accessibility platform for speech-to-sign, sign-to-text, live conversation, and emergency communication.",
  applicationName: "Enabler",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Enabler",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Enabler",
    description: "Breaking Communication Barriers Through AI",
    type: "website",
    images: ["/assets/logo-brand.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enabler",
    description: "Breaking Communication Barriers Through AI",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f1a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${display.variable} font-sans`}>
        <Providers>
          <a href="#main" className="skip-link">
            Skip to main content
          </a>
          <SplashScreen />
          {children}
        </Providers>
      </body>
    </html>
  );
}
