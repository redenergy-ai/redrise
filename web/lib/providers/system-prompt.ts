/**
 * Provider-facing compatibility layer for the RedRise wellness prompt.
 */
import {
  buildWellnessSystemPrompt,
  WELLNESS_SYSTEM_PROMPT_FALLBACK,
  type WellnessContext,
} from "../medical-knowledge";

export const WELLNESS_SYSTEM_PROMPT = WELLNESS_SYSTEM_PROMPT_FALLBACK;

export function resolveSystemPrompt(context?: WellnessContext): string {
  return context ? buildWellnessSystemPrompt(context) : WELLNESS_SYSTEM_PROMPT;
}

// Temporary compatibility exports for existing provider imports.
export const MEDICAL_SYSTEM_PROMPT = WELLNESS_SYSTEM_PROMPT;
export type MedicalContext = WellnessContext;
export type { WellnessContext };
