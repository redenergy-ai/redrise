"use client";

import { useMemo } from "react";
import { HeroInput } from "../chat/HeroInput";
import { type SupportedLanguage } from "@/lib/i18n";
import { getExampleQuestions, pickRandom } from "@/lib/example-questions";

interface HomeViewProps {
  language: SupportedLanguage;
  country: string;
  emergencyNumber: string;
  onNavigate: (view: string) => void;
  onSendMessage: (content: string) => void;
  onStartVoice: () => void;
}

const WELLNESS_DISCLAIMER =
  "RedRise provides general wellness information and self-tracking support. It is not medical care and does not replace a qualified healthcare professional.";

export function HomeView({
  language,
  onSendMessage,
  onStartVoice,
}: HomeViewProps) {
  const suggestions = useMemo(
    () => pickRandom(getExampleQuestions(language), 3),
    [language],
  );

  return (
    <div className="flex-1 overflow-y-auto scroll-touch flex flex-col">
      <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400 mb-3">
            RedRise wellness companion
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-ink-base tracking-tight leading-tight mb-3">
            Rise from the fog.
          </h1>
          <p className="text-lg sm:text-xl font-semibold text-ink-base leading-relaxed max-w-xl mx-auto mb-3">
            Give your body the fuel it needs to heal itself.
          </p>
          <p className="text-ink-muted text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            Track mood, brain fog, energy, sleep, supplements, and daily habits. Notice patterns and build routines that support your wellbeing.
          </p>
        </div>

        <div className="mb-6">
          <HeroInput
            language={language}
            onSend={onSendMessage}
            onStartVoice={onStartVoice}
            size="hero"
            suggestions={suggestions}
          />
        </div>

        <p className="text-center text-[11px] text-ink-subtle leading-relaxed max-w-xl mx-auto">
          {WELLNESS_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
