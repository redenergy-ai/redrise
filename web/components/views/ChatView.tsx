"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { X, Sparkles, CheckCircle2, Leaf } from "lucide-react";
import { MessageBubble } from "../chat/MessageBubble";
import { HeroInput } from "../chat/HeroInput";
import { TypingIndicator } from "../chat/TypingIndicator";
import { TrustBar } from "../chat/TrustBar";
import type { ChatMessage } from "@/lib/hooks/useChat";
import type { EHRProfile } from "@/lib/health-store";
import type { ValidatorContext } from "@/lib/medical-flow/validator";
import { t, type SupportedLanguage } from "@/lib/i18n";
import { getExampleQuestions, pickRandom } from "@/lib/example-questions";
import {
  getSupplementSuggestionsForText,
  type SupplementSuggestionMatch,
} from "@/lib/supplements/mapping";

interface ChatViewProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onSendMessage: (content: string) => void;
  language?: SupportedLanguage;
  emergencyNumber?: string;
  voiceEnabled?: boolean;
  readAloud?: boolean;
  onNavigateEmergency?: () => void;
  onCardAction?: (action: import("@/lib/medical-flow/types").Action, card: import("@/lib/medical-flow/types").Card) => void;
  profileWelcome?: boolean;
  onDismissProfileWelcome?: () => void;
  ehrProfile?: EHRProfile;
  activeMedicationsCount?: number;
  validatorContext?: ValidatorContext;
}

export function ChatView({
  messages,
  isTyping,
  onSendMessage,
  language = "en",
  emergencyNumber = "911",
  voiceEnabled = true,
  readAloud = false,
  onNavigateEmergency,
  onCardAction,
  profileWelcome = false,
  onDismissProfileWelcome,
  ehrProfile,
  activeMedicationsCount = 0,
  validatorContext,
}: ChatViewProps) {
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!readAloud || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (
      last.role === "ai" &&
      !isTyping &&
      typeof speechSynthesis !== "undefined"
    ) {
      const u = new SpeechSynthesisUtterance(last.content);
      u.lang = language;
      speechSynthesis.speak(u);
    }
  }, [messages, isTyping, readAloud, language]);

  const startVoice = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onSendMessage(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const hasMessages = messages.length >= 1;

  const suggestions = useMemo(() => {
    if (hasMessages) return [];
    return pickRandom(getExampleQuestions(language), 3);
  }, [hasMessages, language]);

  const latestUserMessage = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === "user") return messages[index].content;
    }
    return "";
  }, [messages]);

  const supplementMatches = useMemo(
    () => getSupplementSuggestionsForText(latestUserMessage),
    [latestUserMessage],
  );

  return (
    <>
      <div className="flex-1 overflow-y-auto scroll-smooth scroll-touch">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-mobile-nav">
          {!hasMessages && (
            <div className="text-center mb-8 animate-fade-up">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-gradient shadow-glow mb-4">
                <Sparkles size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-ink-base tracking-tight mb-2">
                RedRise wellness companion
              </h2>
              <p className="text-ink-muted leading-relaxed max-w-md mx-auto">
                Talk through how you feel, what you are tracking, and the patterns you want to understand.
              </p>
              <div className="mt-5">
                <TrustBar language={language} />
              </div>
            </div>
          )}

          {profileWelcome && (
            <ProfileWelcome
              profile={ehrProfile}
              activeMedicationsCount={activeMedicationsCount}
              onDismiss={onDismissProfileWelcome}
            />
          )}

          {messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              showSourceChip={
                msg.role === "ai" &&
                i <= 1 &&
                !msg.content.includes("[card:") &&
                !/^\s*(hi|hello|hey)[\s,]/i.test(msg.content) &&
                msg.content.length > 80
              }
              onCardAction={onCardAction}
              validatorContext={validatorContext}
            />
          ))}

          {supplementMatches.length > 0 && (
            <SupplementSuggestions matches={supplementMatches} />
          )}

          {isTyping && <TypingIndicator label={t("ai_analyzing", language)} />}

          <div ref={chatEndRef} />
        </div>
      </div>

      {isListening && (
        <div className="mx-auto -mb-2 max-w-3xl w-full px-4 sm:px-6">
          <div className="flex items-center justify-center gap-2 py-2 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-400 text-sm font-medium animate-pulse">
            {t("ask_tap_speak", language)}…
            <button onClick={stopVoice} className="ml-2 opacity-70 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="sticky-bottom-keyboard px-4 sm:px-6 pt-3 pb-5 pb-safe-area bg-gradient-to-t from-surface-0 via-surface-0/95 to-transparent">
        <div className="max-w-3xl mx-auto">
          <HeroInput
            language={language}
            onSend={onSendMessage}
            onStartVoice={startVoice}
            onStopVoice={stopVoice}
            isListening={isListening}
            voiceEnabled={voiceEnabled}
            suggestions={suggestions}
            autoFocus
            staticPlaceholder={hasMessages}
          />
        </div>
      </div>
    </>
  );
}

function SupplementSuggestions({ matches }: { matches: SupplementSuggestionMatch[] }) {
  const supplements = useMemo(() => {
    const seen = new Set<string>();
    return matches.flatMap((match) => match.supplements).filter((supplement) => {
      if (seen.has(supplement.id)) return false;
      seen.add(supplement.id);
      return true;
    });
  }, [matches]);

  return (
    <div className="mt-5 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4 sm:p-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-brand-500/10 flex items-center justify-center">
          <Leaf size={18} className="text-brand-600 dark:text-brand-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink-base text-sm">Supplement options to explore</p>
          <p className="mt-1 text-xs text-ink-muted leading-relaxed">
            Based on your mention of {matches.map((match) => match.symptom).join(", ")}, these are educational matches from the RedRise supplement catalog.
          </p>
          <div className="mt-3 grid gap-2">
            {supplements.map((supplement) => (
              <div key={supplement.id} className="rounded-xl bg-surface-0/80 border border-surface-3 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink-base">{supplement.name}</p>
                  <span className="text-[10px] uppercase tracking-wide text-ink-subtle">{supplement.brand}</span>
                </div>
                <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                  {supplement.primaryBenefits.slice(0, 2).join(" · ")}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-ink-subtle leading-relaxed">
            Educational discovery only — not a recommendation to start or buy a supplement. Check interactions, allergies, pregnancy/breastfeeding considerations, and suitability with a pharmacist or qualified healthcare professional when relevant.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileWelcome({
  profile,
  activeMedicationsCount,
  onDismiss,
}: {
  profile?: EHRProfile;
  activeMedicationsCount: number;
  onDismiss?: () => void;
}) {
  const summary = useMemo(() => {
    const p = profile || {};
    const parts: string[] = [];
    let demo = "";
    if (p.dateOfBirth) {
      const t = new Date(p.dateOfBirth).getTime();
      if (Number.isFinite(t)) {
        const age = Math.floor((Date.now() - t) / (365.25 * 86400000));
        if (age >= 0 && age < 130) demo = `${age}-year-old`;
      }
    }
    if (p.gender === "male") demo = demo ? `${demo} man` : "Male";
    else if (p.gender === "female") demo = demo ? `${demo} woman` : "Female";
    if (demo) parts.push(demo);
    if (p.chronicConditions?.length) {
      parts.push(
        p.chronicConditions.length === 1
          ? "1 condition"
          : `${p.chronicConditions.length} conditions`,
      );
    }
    if (activeMedicationsCount > 0) {
      parts.push(
        activeMedicationsCount === 1 ? "1 medication" : `${activeMedicationsCount} medications`,
      );
    }
    if (p.allergies?.length && !p.allergies.includes("None known")) {
      parts.push(
        p.allergies.length === 1 ? "1 allergy" : `${p.allergies.length} allergies`,
      );
    }
    return parts.join(" · ");
  }, [profile, activeMedicationsCount]);

  return (
    <div className="mb-6 rounded-2xl border border-success-500/30 bg-success-500/5 p-4 sm:p-5 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-success-500/15 flex items-center justify-center">
          <CheckCircle2 size={18} className="text-success-500" strokeWidth={2.25} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink-base text-sm">
            Profile saved — RedRise will tailor its wellness reflections
          </p>
          {summary && (
            <p className="mt-0.5 text-xs text-ink-muted truncate">
              {summary}
            </p>
          )}
          <p className="mt-2 text-[11px] text-ink-subtle leading-relaxed">
            RedRise provides general wellness information and self-tracking support. It is not medical care and does not replace a qualified healthcare professional.
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            className="flex-shrink-0 p-1 rounded-md text-ink-subtle hover:text-ink-base hover:bg-surface-2 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
