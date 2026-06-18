import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Enabler — AI Accessibility Tools",
  description:
    "Breaking communication barriers through AI accessibility tools for speech, sign language, and live conversations.",
  icons: { icon: "/assets/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/css/styles.css" />
      </head>
      <body>
        {children}
        <Script src="/js/utils/state.js" strategy="beforeInteractive" />
        <Script src="/js/utils/toast.js" strategy="beforeInteractive" />
        <Script src="/js/utils/api.js" strategy="beforeInteractive" />
        <Script src="/js/utils/ui-states.js" strategy="beforeInteractive" />
        <Script src="/js/utils/pipeline-ui.js" strategy="beforeInteractive" />
        <Script src="/js/utils/speech-engine.js" strategy="lazyOnload" />
        <Script src="/js/utils/sign-engine.js" strategy="lazyOnload" />
        <Script src="/js/router.js" strategy="afterInteractive" />
        <Script src="/js/views/home.js" strategy="afterInteractive" />
        <Script src="/js/views/speech-sign.js" strategy="afterInteractive" />
        <Script src="/js/views/sign-text.js" strategy="afterInteractive" />
        <Script src="/js/views/live.js" strategy="afterInteractive" />
        <Script src="/js/views/video.js" strategy="afterInteractive" />
        <Script src="/js/views/emergency.js" strategy="afterInteractive" />
        <Script src="/js/views/alerts.js" strategy="afterInteractive" />
        <Script src="/js/app.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
