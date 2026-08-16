"use client";

import { useMemo, useState } from "react";
import { Brain, CalendarDays, Check, ChevronDown, Leaf, Moon, Save, Sparkles, Zap } from "lucide-react";
import { SUPPLEMENTS } from "@/lib/supplements/data";
import {
  average,
  lastSevenDays,
  loadCheckins,
  readAuthIdentity,
  saveCheckin,
  supplementCorrelations,
  syncCheckin,
  trendPercent,
  type ScoreKey,
  type WellnessScores,
} from "@/lib/wellness/checkins";
import type { SupportedLanguage } from "@/lib/i18n";

interface HealthDashboardProps {
  medications?: any[];
  medicationLogs?: any[];
  appointments?: any[];
  vitals?: any[];
  records?: any[];
  onNavigate?: (view: string) => void;
  onMarkMedTaken?: (...args: any[]) => void;
  isMedTaken?: (...args: any[]) => boolean;
  getMedStreak?: (...args: any[]) => number;
  onExport?: () => void;
  language?: SupportedLanguage;
  isAuthenticated?: boolean;
}

const SCORE_META: Array<{ key: ScoreKey; label: string; icon: any; low: string; high: string }> = [
  { key: "mood", label: "Mood", icon: Sparkles, low: "Very low", high: "Very good" },
  { key: "energy", label: "Energy", icon: Zap, low: "Drained", high: "Energised" },
  { key: "focus", label: "Focus", icon: Brain, low: "Very foggy", high: "Very clear" },
  { key: "sleep", label: "Sleep", icon: Moon, low: "Poor", high: "Restorative" },
  { key: "stress", label: "Stress", icon: ChevronDown, low: "Calm", high: "Very stressed" },
];

const DEFAULT_SCORES: WellnessScores = { mood: 5, energy: 5, focus: 5, sleep: 5, stress: 5 };

export function HealthDashboard({ isAuthenticated = false }: HealthDashboardProps) {
  const identity = useMemo(() => readAuthIdentity(), []);
  const [scores, setScores] = useState<WellnessScores>(DEFAULT_SCORES);
  const [journal, setJournal] = useState("");
  const [supplements, setSupplements] = useState<string[]>([]);
  const [savedNotice, setSavedNotice] = useState("");
  const [revision, setRevision] = useState(0);

  const checkins = useMemo(() => loadCheckins(identity.userId), [identity.userId, revision]);
  const week = useMemo(() => lastSevenDays(checkins), [checkins]);
  const correlations = useMemo(() => supplementCorrelations(week).slice(0, 5), [week]);

  const toggleSupplement = (name: string) => {
    setSupplements((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );
  };

  const handleSave = async () => {
    const saved = saveCheckin(
      {
        date: new Date().toISOString().slice(0, 10),
        journal: journal.trim(),
        supplements,
        ...scores,
      },
      identity.userId,
    );
    await syncCheckin(saved, identity.token);
    setRevision((value) => value + 1);
    setSavedNotice("Today's check-in is saved.");
    window.setTimeout(() => setSavedNotice(""), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-mobile-nav scroll-touch">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-500">Daily check-in</p>
          <h2 className="text-2xl font-bold text-ink-base mt-1">How are you doing today?</h2>
          <p className="text-sm text-ink-muted mt-2 max-w-xl">
            Track mood, energy, brain fog, sleep and stress. Scores are observations, not diagnoses.
          </p>
        </header>

        <section className="rounded-2xl border border-line/60 bg-surface-1 shadow-soft p-4 sm:p-6 space-y-5">
          {SCORE_META.map(({ key, label, icon: Icon, low, high }) => (
            <div key={key}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink-base">
                  <Icon size={16} className="text-brand-500" /> {label}
                </div>
                <span className="min-w-9 text-center rounded-lg bg-brand-500/10 px-2 py-1 text-sm font-black text-brand-600">
                  {scores[key]}
                </span>
              </div>
              <input
                aria-label={`${label} score`}
                type="range"
                min={1}
                max={10}
                step={1}
                value={scores[key]}
                onChange={(event) => setScores((current) => ({ ...current, [key]: Number(event.target.value) }))}
                className="w-full accent-brand-500"
              />
              <div className="flex justify-between text-[10px] text-ink-subtle mt-1"><span>{low}</span><span>{high}</span></div>
            </div>
          ))}

          <div>
            <label className="block text-sm font-semibold text-ink-base mb-2">Journal</label>
            <textarea
              value={journal}
              onChange={(event) => setJournal(event.target.value)}
              rows={4}
              maxLength={3000}
              placeholder="What affected your mood, energy or focus today?"
              className="w-full rounded-xl border border-line/60 bg-surface-0 px-3 py-3 text-sm text-ink-base focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2"><Leaf size={15} className="text-brand-500" /><p className="text-sm font-semibold text-ink-base">Supplements taken today</p></div>
            <div className="flex flex-wrap gap-2">
              {SUPPLEMENTS.map((supplement) => {
                const active = supplements.includes(supplement.name);
                return (
                  <button
                    key={supplement.id}
                    type="button"
                    onClick={() => toggleSupplement(supplement.name)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${active ? "border-brand-500 bg-brand-500/10 text-brand-600" : "border-line/60 bg-surface-0 text-ink-muted hover:border-brand-500/40"}`}
                  >
                    {active && <Check size={11} className="inline mr-1" />}{supplement.name}
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={handleSave} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-bold text-white shadow-glow">
            <Save size={16} /> Save today's check-in
          </button>
          {savedNotice && <p className="text-sm font-semibold text-success-600">{savedNotice}</p>}
          {!isAuthenticated && <p className="text-[11px] text-ink-subtle">Guest check-ins are kept only for this browser session. Sign in to link logs to your account.</p>}
        </section>

        <WeeklySummary week={week} correlations={correlations} />
      </div>
    </div>
  );
}

function WeeklySummary({ week, correlations }: { week: ReturnType<typeof lastSevenDays>; correlations: ReturnType<typeof supplementCorrelations> }) {
  const metrics: ScoreKey[] = ["mood", "energy", "focus", "sleep", "stress"];
  return (
    <section className="rounded-2xl border border-line/60 bg-surface-1 shadow-soft p-4 sm:p-6">
      <div className="flex items-center gap-2"><CalendarDays size={18} className="text-brand-500" /><h3 className="font-bold text-ink-base">Last 7 days</h3></div>
      {week.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">Complete a daily check-in to start seeing weekly patterns.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
            {metrics.map((metric) => {
              const avg = average(week, metric);
              const trend = trendPercent(week, metric);
              return (
                <div key={metric} className="rounded-xl border border-line/50 bg-surface-0 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-ink-subtle">{metric}</p>
                  <p className="text-xl font-black text-ink-base mt-1">{avg?.toFixed(1) ?? "—"}</p>
                  <p className="text-[10px] text-ink-muted mt-1">{trend == null ? "Not enough trend data" : `${trend >= 0 ? "+" : ""}${trend.toFixed(0)}% vs earlier days`}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-ink-base">Patterns to explore</p>
            {correlations.length === 0 ? (
              <p className="mt-2 text-xs text-ink-muted">Log supplements on both taken and non-taken days to compare your own scores.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {correlations.map((item) => {
                  const percentage = item.withoutAverage === 0 ? null : (item.difference / item.withoutAverage) * 100;
                  const comparison = percentage == null
                    ? ""
                    : ` — ${Math.abs(percentage).toFixed(0)}% ${percentage >= 0 ? "higher" : "lower"}`;
                  return (
                    <div key={`${item.supplement}-${item.metric}`} className="rounded-xl bg-brand-500/5 border border-brand-500/15 p-3 text-xs text-ink-muted leading-relaxed">
                      On days you logged <strong className="text-ink-base">{item.supplement}</strong>, your {item.metric} score averaged <strong className="text-ink-base">{item.withAverage.toFixed(1)}</strong> vs. <strong className="text-ink-base">{item.withoutAverage.toFixed(1)}</strong> on days you did not{comparison} ({item.withDays} vs {item.withoutDays} day{item.withoutDays === 1 ? "" : "s"}).
                    </div>
                  );
                })}
              </div>
            )}
            <p className="mt-3 text-[11px] text-ink-subtle leading-relaxed">These are simple within-your-log associations. They do not show that a supplement caused a change; sleep, routines, stress and other factors may differ between days.</p>
          </div>
        </>
      )}
    </section>
  );
}
