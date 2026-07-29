import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://enabler.app";
  const routes = [
    "",
    "/app",
    "/app/speech",
    "/app/sign",
    "/app/conversation",
    "/app/video",
    "/app/emergency",
    "/app/alerts",
    "/app/assistant",
    "/app/history",
    "/app/settings",
    "/app/help",
  ];
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
