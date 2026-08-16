import { SUPPLEMENTS } from "@/lib/supplements/data";

export type WellnessScores = {
  mood: number;
  energy: number;
  focus: number;
  sleep: number;
  stress: number;
};

export type WellnessCheckin = WellnessScores & {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  journal: string;
  supplements: string[];
  createdAt: string;
};

export type ScoreKey = keyof WellnessScores;

const CHECKIN_PREFIX = "redrise_wellness_checkins";
const GUEST_KEY = `${CHECKIN_PREFIX}__guest`;

function safeStorage(userId?: string | null): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return userId ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function keyFor(userId?: string | null): string {
  return userId ? `${CHECKIN_PREFIX}__${userId}` : GUEST_KEY;
}

export function readAuthIdentity(): { userId: string | null; token: string | null } {
  if (typeof window === "undefined") return { userId: null, token: null };
  const token = window.localStorage.getItem("medos_auth_token");
  if (!token) return { userId: null, token: null };
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    const userId = String(payload.sub || payload.user_id || payload.id || "").trim() || null;
    return { userId, token };
  } catch {
    return { userId: null, token };
  }
}

export function loadCheckins(userId?: string | null): WellnessCheckin[] {
  const storage = safeStorage(userId);
  if (!storage) return [];
  try {
    const raw = storage.getItem(keyFor(userId));
    const items = raw ? (JSON.parse(raw) as WellnessCheckin[]) : [];
    return items.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

export function saveCheckin(
  input: Omit<WellnessCheckin, "id" | "createdAt" | "userId">,
  userId?: string | null,
): WellnessCheckin {
  const storage = safeStorage(userId);
  const current = loadCheckins(userId);
  const existing = current.find((item) => item.date === input.date);
  const saved: WellnessCheckin = {
    ...input,
    id: existing?.id || `wc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    userId: userId || "guest",
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  const next = [saved, ...current.filter((item) => item.date !== input.date)];
  storage?.setItem(keyFor(userId), JSON.stringify(next));
  return saved;
}

export function lastSevenDays(checkins: WellnessCheckin[], today = new Date()): WellnessCheckin[] {
  const cutoff = new Date(today);
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - 6);
  const cutoffIso = cutoff.toISOString().slice(0, 10);
  return checkins.filter((item) => item.date >= cutoffIso).sort((a, b) => a.date.localeCompare(b.date));
}

export function average(items: WellnessCheckin[], key: ScoreKey): number | null {
  if (!items.length) return null;
  return items.reduce((sum, item) => sum + item[key], 0) / items.length;
}

export function trendPercent(items: WellnessCheckin[], key: ScoreKey): number | null {
  if (items.length < 2) return null;
  const split = Math.max(1, Math.floor(items.length / 2));
  const early = items.slice(0, split);
  const late = items.slice(split);
  if (!late.length) return null;
  const a = average(early, key);
  const b = average(late, key);
  if (a == null || b == null || a === 0) return null;
  return ((b - a) / a) * 100;
}

export type SupplementCorrelation = {
  supplement: string;
  metric: ScoreKey;
  withAverage: number;
  withoutAverage: number;
  difference: number;
  withDays: number;
  withoutDays: number;
};

export function supplementCorrelations(items: WellnessCheckin[]): SupplementCorrelation[] {
  const metrics: ScoreKey[] = ["mood", "energy", "focus", "sleep", "stress"];
  const names = SUPPLEMENTS.map((item) => item.name);
  const out: SupplementCorrelation[] = [];

  for (const supplement of names) {
    const withSupplement = items.filter((item) => item.supplements.includes(supplement));
    const withoutSupplement = items.filter((item) => !item.supplements.includes(supplement));
    if (!withSupplement.length || !withoutSupplement.length) continue;

    for (const metric of metrics) {
      const withAverage = average(withSupplement, metric)!;
      const withoutAverage = average(withoutSupplement, metric)!;
      out.push({
        supplement,
        metric,
        withAverage,
        withoutAverage,
        difference: withAverage - withoutAverage,
        withDays: withSupplement.length,
        withoutDays: withoutSupplement.length,
      });
    }
  }

  return out
    .filter((item) => Math.abs(item.difference) >= 0.5)
    .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
}

export async function syncCheckin(checkin: WellnessCheckin, token?: string | null): Promise<void> {
  if (!token) return;
  await fetch("/api/proxy/health-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id: checkin.id, type: "wellness_checkin", data: checkin }),
  }).catch(() => {});
}
