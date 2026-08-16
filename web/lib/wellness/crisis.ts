export const MENTAL_HEALTH_CRISIS_PATTERNS: RegExp[] = [
  /\b(kill|hurt|harm) myself\b/i,
  /\b(end|take) my (life|own life)\b/i,
  /\bwant to die\b/i,
  /\bdon['’]?t want to (live|be alive)\b/i,
  /\bbetter off dead\b/i,
  /\bsuicid(?:e|al)\b/i,
  /\bself[- ]?harm\b/i,
  /\bcan['’]?t keep myself safe\b/i,
  /\bnot safe (with|by) myself\b/i,
  /\bplanning to (die|kill myself|hurt myself)\b/i,
];

export function hasMentalHealthCrisisSignal(text: string): boolean {
  return MENTAL_HEALTH_CRISIS_PATTERNS.some((pattern) => pattern.test(text));
}

export function buildCrisisResponse(country: string | undefined, emergencyNumber: string | undefined): string {
  if ((country || "").toUpperCase() === "ZA") {
    return [
      "I’m concerned that you may be at risk of harming yourself. Your immediate safety matters more than continuing the wellness conversation.",
      "",
      "**Please get human help now:**",
      "- Call **112** from a mobile phone for an immediate emergency.",
      "- If you need an ambulance from a landline, call **10177**.",
      "- South African Depression and Anxiety Group (SADAG) Suicide Crisis Helpline: **0800 567 567** (24 hours).",
      "- SADAG crisis resources: https://www.sadag.org/",
      "",
      "If you can, move away from anything you could use to hurt yourself and stay with, call, or message a trusted person until help is with you.",
    ].join("\n");
  }

  const number = emergencyNumber || "112";
  return [
    "I’m concerned that you may be at risk of harming yourself. Your immediate safety matters more than continuing the wellness conversation.",
    "",
    `Please contact local emergency services now at **${number}**, or go to the nearest emergency department.`,
    "If you can, move away from anything you could use to hurt yourself and stay with, call, or message a trusted person until help is with you.",
  ].join("\n");
}
