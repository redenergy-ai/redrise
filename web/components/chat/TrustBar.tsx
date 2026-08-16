"use client";

import { ShieldCheck, Globe2, Clock4 } from "lucide-react";
import type { SupportedLanguage } from "@/lib/i18n";

interface TrustBarProps {
  language: SupportedLanguage;
  compact?: boolean;
}

export function TrustBar({ compact = false }: TrustBarProps) {
  const items = [
    { Icon: ShieldCheck, label: "Wellness guidance, not medical care" },
    { Icon: Globe2, label: "Private self-tracking" },
    { Icon: Clock4, label: "Available anytime" },
  ];

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-ink-muted ${
        compact ? "text-[11px]" : "text-xs"
      }`}
    >
      {items.map(({ Icon, label }) => (
        <span key={label} className="inline-flex items-center gap-1.5 font-medium">
          <Icon size={compact ? 12 : 14} className="text-accent-500" />
          {label}
        </span>
      ))}
    </div>
  );
}
