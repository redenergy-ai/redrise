/**
 * Deterministic safety validator for AI-emitted cards.
 *
 * RedRise keeps this layer even after the wellness reframe because emergency
 * routing and malformed-card handling must not depend on model behaviour.
 */

import { z } from "zod";
import type { Card, Action } from "./types";

const ActionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  style: z.enum(["primary", "secondary", "danger", "ghost"]).optional(),
  icon: z.string().optional(),
});

const GreetingSchema = z.object({
  kind: z.literal("greeting"),
  text: z.string().min(1),
  actions: z.array(ActionSchema).max(6),
});

const SafetyCheckSchema = z.object({
  kind: z.literal("safety_check"),
  title: z.string().min(1),
  question: z.string().min(1),
  options: z.array(ActionSchema).min(2).max(12),
  on_positive: z.enum(["emergency", "urgent_care", "continue"]),
});

const IntakeSchema = z.object({
  kind: z.literal("intake"),
  title: z.string().min(1),
  question: z.string().min(1),
  input_type: z.enum(["chips", "slider", "text"]),
  options: z.array(ActionSchema).max(12).optional(),
  slider: z.object({
    min: z.number(),
    max: z.number(),
    min_label: z.string().optional(),
    max_label: z.string().optional(),
  }).optional(),
  progress: z.number().min(0).max(1),
});

const GuidanceSchema = z.object({
  kind: z.literal("guidance"),
  title: z.string().min(1),
  care_level: z.enum(["self-care", "routine", "urgent", "emergency"]),
  why: z.string().min(1),
  what_now: z.array(z.string().min(1)).min(1),
  seek_care_if: z.array(z.string().min(1)).min(1),
  sources: z.array(z.string()).optional(),
});

const ProfileGateSchema = z.object({
  kind: z.literal("profile_gate"),
  title: z.string().min(1),
  reason: z.string().min(1),
  required_fields: z.array(z.string()).min(1),
  actions: z.array(ActionSchema).min(1).max(6),
});

const LimitedGuidanceSchema = z.object({
  kind: z.literal("limited_guidance"),
  general_advice: z.string().min(1),
  what_now: z.array(z.string()).min(1),
  missing_for_personalization: z.array(z.string()).min(1),
  actions: z.array(ActionSchema).min(1).max(6),
});

const EmergencySchema = z.object({
  kind: z.literal("emergency"),
  headline: z.string().min(1),
  reason: z.string().min(1),
  emergency_number: z.string().regex(/^[0-9+]{2,8}$/),
  actions: z.array(ActionSchema).min(1).max(6),
});

const NextStepsSchema = z.object({
  kind: z.literal("next_steps"),
  title: z.string().min(1),
  summary: z.string().optional(),
  actions: z.array(ActionSchema).min(1).max(6),
});

const DoctorSummarySchema = z.object({
  kind: z.literal("doctor_summary"),
  chief_complaint: z.string().min(1),
  duration: z.string().min(1),
  severity: z.number().min(0).max(10).optional(),
  red_flags_checked: z.array(z.string()),
  warning_signs_present: z.array(z.string()),
  current_guidance: z.string().min(1),
  seek_care_if: z.array(z.string()),
  generated_at: z.string().min(1),
});

const ContextSwitchSchema = z.object({
  kind: z.literal("context_switch"),
  previous_topic: z.string().min(1),
  new_topic: z.string().min(1),
  new_patient: z.boolean().optional(),
  response: z.string().min(1),
  suggested_action: ActionSchema,
});

const CardSchema = z.discriminatedUnion("kind", [
  GreetingSchema,
  SafetyCheckSchema,
  IntakeSchema,
  GuidanceSchema,
  ProfileGateSchema,
  LimitedGuidanceSchema,
  EmergencySchema,
  NextStepsSchema,
  DoctorSummarySchema,
  ContextSwitchSchema,
]);

/**
 * South Africa deliberately uses 112 as RedRise's PRIMARY emergency route.
 * 10177 is an ambulance/landline fallback shown in ZA crisis copy, not the
 * emergency-card primary. 10111 is intentionally absent from medical and
 * mental-health emergency routing.
 */
const EMERGENCY_NUMBERS: Record<string, string> = {
  US: "911", CA: "911", MX: "911", GB: "999", IE: "999", AU: "000", NZ: "111",
  IT: "112", DE: "112", FR: "112", ES: "112", PT: "112", NL: "112", PL: "112",
  AT: "112", BE: "112", CH: "112", IN: "112", PK: "115", BD: "999", CN: "120",
  KR: "119", JP: "119", TH: "1669", VN: "115", SA: "997", AE: "998", EG: "123",
  ZA: "112", NG: "112", KE: "999", TZ: "112", BR: "192", AR: "107", CO: "123",
};

const DEFAULT_EMERGENCY_NUMBER = "112";

const ALLERGY_BLOCKLIST: Record<string, RegExp[]> = {
  penicillin: [/\bamoxicillin\b/i, /\bampicillin\b/i, /\baugmentin\b/i, /\bpenicillin\b/i],
  nsaid: [/\bibuprofen\b/i, /\bnaproxen\b/i, /\baspirin\b/i, /\bdiclofenac\b/i, /\bketorolac\b/i],
  aspirin: [/\baspirin\b/i],
  sulfa: [/\bsulfamethoxazole\b/i, /\bsulfasalazine\b/i, /\bbactrim\b/i, /\bseptra\b/i],
  codeine: [/\bcodeine\b/i, /\btramadol\b/i],
};

export interface ValidatorContext {
  country?: string;
  allergies?: string[];
}

export type ValidationResult =
  | { ok: true; card: Card; repaired: string[] }
  | { ok: false; card: Card | null; errors: string[] };

type Rule = (card: any, ctx: ValidatorContext) => { error?: string; repair?: string } | null;

const REQUIRED_SAFETY_OPTIONS: Action[] = [
  { label: "None of these", value: "rf:none", style: "ghost" },
  { label: "Not sure", value: "rf:unsure", style: "ghost" },
];

const requireSafetyEscapeOptions: Rule = (card) => {
  if (card.kind !== "safety_check") return null;
  const values = new Set((card.options as Action[]).map((option) => option.value));
  const missing = REQUIRED_SAFETY_OPTIONS.filter((option) => !values.has(option.value));
  if (!missing.length) return null;
  card.options.push(...missing);
  return { repair: `appended ${missing.map((item) => item.value).join(", ")}` };
};

const enforceEmergencyLocale: Rule = (card, ctx) => {
  if (card.kind !== "emergency") return null;
  const country = ctx.country?.toUpperCase();
  const expected = (country && EMERGENCY_NUMBERS[country]) || DEFAULT_EMERGENCY_NUMBER;
  if (card.emergency_number === expected) return null;
  const wrong = card.emergency_number;
  card.emergency_number = expected;
  for (const action of card.actions || []) {
    if (typeof action.label === "string") action.label = action.label.replace(wrong, expected);
    if (typeof action.value === "string" && action.value.startsWith("tel:")) action.value = `tel:${expected}`;
  }
  return { repair: `emergency_number ${wrong} → ${expected} for ${country || "default"}` };
};

const scrubAllergens: Rule = (card, ctx) => {
  if (!ctx.allergies?.length) return null;
  if (card.kind !== "guidance" && card.kind !== "limited_guidance") return null;
  const patterns = ctx.allergies.flatMap((allergy) => ALLERGY_BLOCKLIST[allergy.toLowerCase()] || []);
  if (!patterns.length) return null;
  let hits = 0;
  const scrub = (input: string): string => {
    let value = input;
    for (const pattern of patterns) {
      if (pattern.test(value)) {
        hits += 1;
        value = value.replace(pattern, "[removed: conflicts with declared allergy]");
      }
    }
    return value;
  };
  if (card.kind === "guidance") {
    card.why = scrub(card.why);
    card.what_now = card.what_now.map(scrub);
  } else {
    card.general_advice = scrub(card.general_advice);
    card.what_now = card.what_now.map(scrub);
  }
  return hits ? { repair: `scrubbed ${hits} allergy-conflicting reference(s)` } : null;
};

const enforceIntakeShape: Rule = (card) => {
  if (card.kind !== "intake") return null;
  if (card.input_type === "chips" && (!card.options || card.options.length === 0)) {
    return { error: "intake.input_type=chips but options is empty" };
  }
  if (card.input_type === "slider" && !card.slider) {
    return { error: "intake.input_type=slider but slider is missing" };
  }
  return null;
};

const enforceDoctorSummaryGenerated: Rule = (card) => {
  if (card.kind !== "doctor_summary") return null;
  if (!card.generated_at || Number.isNaN(Date.parse(card.generated_at))) {
    card.generated_at = new Date().toISOString();
    return { repair: "filled missing generated_at with now()" };
  }
  return null;
};

const RULES: Rule[] = [
  requireSafetyEscapeOptions,
  enforceEmergencyLocale,
  scrubAllergens,
  enforceIntakeShape,
  enforceDoctorSummaryGenerated,
];

export function validateCard(card: unknown, ctx: ValidatorContext = {}): ValidationResult {
  const parsed = CardSchema.safeParse(card);
  if (!parsed.success) {
    return {
      ok: false,
      card: null,
      errors: parsed.error.issues.map((issue) => `${issue.path.join(".") || "card"}: ${issue.message}`),
    };
  }

  const safeCard = parsed.data as Card;
  const repaired: string[] = [];
  const errors: string[] = [];
  for (const rule of RULES) {
    const result = rule(safeCard, ctx);
    if (result?.repair) repaired.push(result.repair);
    if (result?.error) errors.push(result.error);
  }

  if (errors.length) return { ok: false, card: safeCard, errors };
  return { ok: true, card: safeCard, repaired };
}
