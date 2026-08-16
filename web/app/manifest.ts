import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RedRise — wellness companion",
    short_name: "RedRise",
    description:
      "A private wellness companion for mood, brain fog, energy, sleep, supplements, and daily habits.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    theme_color: "#3B82F6",
    background_color: "#F7F9FB",
    categories: ["health", "lifestyle"],
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Open RedRise",
        short_name: "Open",
        url: "/?source=shortcut",
      },
      {
        name: "Wellness Dashboard",
        short_name: "Wellness",
        url: "/?view=health-dashboard",
      },
    ],
    prefer_related_applications: false,
  };
}
