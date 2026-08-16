"use client";

import { AlertTriangle, HeartHandshake, Phone, ShieldAlert } from "lucide-react";
import type { SupportedLanguage } from "@/lib/i18n";

interface EmergencyViewProps {
  language: SupportedLanguage;
  emergencyNumber: string;
}

export function EmergencyView({ emergencyNumber }: EmergencyViewProps) {
  const primary = emergencyNumber === "10177" ? "112" : emergencyNumber;
  const isSouthAfrica = primary === "112";

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-mobile-nav scroll-touch">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-500/10 flex items-center justify-center">
            <ShieldAlert size={30} className="text-danger-500" />
          </div>
          <h1 className="text-2xl font-bold text-ink-base">Crisis & emergency help</h1>
          <p className="text-sm text-ink-muted mt-2 max-w-lg mx-auto">
            If you may hurt yourself, cannot keep yourself safe, or are in immediate danger, contact a person who can help you now.
          </p>
        </header>

        <a href={`tel:${primary}`} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-danger-500 py-5 text-xl font-bold text-white shadow-card hover:brightness-95">
          <Phone size={23} /> Call {primary} now
        </a>

        {isSouthAfrica && (
          <section className="rounded-2xl border border-danger-500/25 bg-danger-500/5 p-5">
            <div className="flex items-start gap-3">
              <HeartHandshake size={22} className="text-danger-500 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-bold text-ink-base">South African mental health support</h2>
                <p className="mt-1 text-sm text-ink-muted">SADAG Suicide Crisis Helpline — available 24 hours.</p>
                <a href="tel:0800567567" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-surface-0 border border-line/60 px-4 py-2.5 font-bold text-ink-base hover:border-danger-500/40">
                  <Phone size={15} /> 0800 567 567
                </a>
                <a href="https://www.sadag.org/" target="_blank" rel="noreferrer" className="block mt-3 text-sm font-semibold text-brand-600 hover:underline">
                  Open SADAG crisis resources
                </a>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-line/60 bg-surface-1 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-warning-500 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-ink-base">While help is on the way</h2>
              <ul className="mt-2 space-y-2 text-sm text-ink-muted list-disc pl-5">
                <li>Move away from medicines, weapons, heights, traffic, or anything else you could use to hurt yourself.</li>
                <li>Stay with another person, or call/message someone you trust and tell them you do not feel safe.</li>
                <li>Do not stay alone if you believe you may act on thoughts of self-harm.</li>
              </ul>
            </div>
          </div>
        </section>

        {isSouthAfrica && (
          <p className="text-xs text-ink-subtle text-center">
            South Africa: 112 is the primary cellphone emergency number. For ambulance service from a landline, 10177 is the secondary fallback.
          </p>
        )}
      </div>
    </div>
  );
}
