import { getSupplementByName, type Supplement } from "./data";

export const SYMPTOM_SUPPLEMENT_MAP: Record<string, string[]> = {
  "brain fog": ["Rhodiola", "Lion's Mane", "NAC"],
  "low energy": ["Rhodiola", "L-Tyrosine"],
  "low mood": ["5-HTP", "Omega-3"],
  "poor sleep": ["Magnesium Glycinate"],
  stress: ["Rhodiola", "Magnesium Glycinate"],
};

const SYMPTOM_ALIASES: Record<string, string[]> = {
  "brain fog": ["brain fog", "foggy", "mental fog", "can't think", "cannot think", "poor concentration", "hard to focus"],
  "low energy": ["low energy", "no energy", "tired", "fatigue", "fatigued", "drained", "exhausted"],
  "low mood": ["low mood", "feeling low", "down", "flat mood", "sad", "unmotivated"],
  "poor sleep": ["poor sleep", "bad sleep", "can't sleep", "cannot sleep", "trouble sleeping", "restless sleep", "insomnia"],
  stress: ["stress", "stressed", "overwhelmed", "tense", "burned out", "burnt out"],
};

export type SupplementSuggestionMatch = {
  symptom: string;
  supplements: Supplement[];
};

export function getSupplementSuggestionsForText(
  input: string,
): SupplementSuggestionMatch[] {
  const normalized = input.toLowerCase();

  return Object.entries(SYMPTOM_ALIASES)
    .filter(([, aliases]) => aliases.some((alias) => normalized.includes(alias)))
    .map(([symptom]) => ({
      symptom,
      supplements: (SYMPTOM_SUPPLEMENT_MAP[symptom] ?? [])
        .map(getSupplementByName)
        .filter((supplement): supplement is Supplement => Boolean(supplement)),
    }))
    .filter((match) => match.supplements.length > 0);
}

export function getUniqueSupplementSuggestions(input: string): Supplement[] {
  const seen = new Set<string>();
  const matches = getSupplementSuggestionsForText(input);
  const result: Supplement[] = [];

  for (const match of matches) {
    for (const supplement of match.supplements) {
      if (seen.has(supplement.id)) continue;
      seen.add(supplement.id);
      result.push(supplement);
    }
  }

  return result;
}
