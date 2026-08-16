export type Supplement = {
  id: string;
  name: string;
  brand: "Natra-Heal";
  productName?: string;
  description: string;
  keyIngredients: string[];
  primaryBenefits: string[];
  interactionsAndCautions: string[];
};

/**
 * Curated RedRise supplement knowledge base.
 *
 * Product composition is based on Natra-Heal's published catalog where a
 * current product page is available. Benefit language is intentionally kept
 * educational and non-diagnostic: these are areas people commonly explore,
 * not promises that a supplement will prevent, treat, or resolve a condition.
 */
export const SUPPLEMENTS: Supplement[] = [
  {
    id: "rhodiola",
    name: "Rhodiola",
    brand: "Natra-Heal",
    productName: "Rhodiola Rosea Capsules",
    description:
      "An adaptogenic botanical commonly explored for resilience to everyday stress, perceived energy, and mental stamina.",
    keyIngredients: ["Rhodiola rosea — 510.6 mg per serving (published product label)"],
    primaryBenefits: [
      "Everyday stress resilience",
      "Perceived energy and stamina",
      "Mental clarity and focus support",
    ],
    interactionsAndCautions: [
      "Evidence for health benefits is still limited and mixed.",
      "Possible side effects include dizziness, headache, insomnia, dry mouth, or increased saliva.",
      "An interaction with losartan has been reported; review use with a clinician or pharmacist if taking medicines.",
      "Safety during pregnancy and breastfeeding is not well established.",
    ],
  },
  {
    id: "l-tyrosine",
    name: "L-Tyrosine",
    brand: "Natra-Heal",
    productName: "Depression Assist Capsules",
    description:
      "An amino acid used by the body as a building block for catecholamine neurotransmitters; commonly explored for focus and performance during demanding situations.",
    keyIngredients: [
      "L-Tyrosine — 156 mg per Depression Assist capsule",
      "Depression Assist also contains L-Glutamine, L-Phenylalanine, 5-HTP/Tryptophan, P5P, and ascorbic acid",
    ],
    primaryBenefits: [
      "Focus support during demanding periods",
      "Mental performance support",
      "Perceived energy support",
    ],
    interactionsAndCautions: [
      "Check suitability with a clinician or pharmacist if using prescription medicines, especially medicines that affect dopamine, thyroid function, or blood pressure.",
      "Use extra caution with stimulant-like products or if prone to agitation or insomnia.",
      "Safety during pregnancy and breastfeeding has not been established for this product combination.",
    ],
  },
  {
    id: "5-htp",
    name: "5-HTP",
    brand: "Natra-Heal",
    productName: "Depression Assist Capsules",
    description:
      "A serotonin precursor included in Natra-Heal Depression Assist; commonly discussed in relation to mood and sleep support.",
    keyIngredients: [
      "5-HTP/Tryptophan — 35 mg per Depression Assist capsule (published combined label entry)",
      "Depression Assist also contains L-Glutamine, L-Phenylalanine, L-Tyrosine, P5P, and ascorbic acid",
    ],
    primaryBenefits: ["Mood support", "Sleep-related wellness support"],
    interactionsAndCautions: [
      "Do not combine with antidepressants or other serotonin-raising medicines or supplements without clinician or pharmacist guidance because excessive serotonin can be dangerous.",
      "May cause gastrointestinal effects or drowsiness in some people.",
      "Safety during pregnancy and breastfeeding is not established.",
    ],
  },
  {
    id: "magnesium-glycinate",
    name: "Magnesium Glycinate",
    brand: "Natra-Heal",
    productName: "Magnesium Glycinate Capsules",
    description:
      "A chelated form of magnesium commonly chosen for relaxation, muscle function, and general magnesium intake.",
    keyIngredients: [
      "Magnesium glycinate — 642 mg per capsule",
      "Elemental magnesium — 91.2 mg per capsule (published product label)",
    ],
    primaryBenefits: [
      "Relaxation and calm support",
      "Normal muscle function",
      "Sleep-routine support",
    ],
    interactionsAndCautions: [
      "Supplemental magnesium can cause diarrhea, nausea, or abdominal cramping, especially at higher amounts.",
      "Magnesium can interfere with absorption of some antibiotics and osteoporosis medicines; timing may need to be separated.",
      "People with significant kidney impairment should seek professional guidance before supplementing magnesium.",
    ],
  },
  {
    id: "nac",
    name: "NAC",
    brand: "Natra-Heal",
    productName: "NAC (N-Acetyl Cysteine) Capsules",
    description:
      "N-acetyl cysteine is a cysteine donor and precursor to glutathione, commonly explored for antioxidant and cellular redox support.",
    keyIngredients: ["N-Acetyl Cysteine — 697 mg per capsule (published product label)"],
    primaryBenefits: [
      "Glutathione precursor support",
      "Antioxidant support",
      "General recovery and cellular wellness support",
    ],
    interactionsAndCautions: [
      "May cause nausea, vomiting, or gastrointestinal discomfort in some people.",
      "People with asthma or significant respiratory sensitivity should discuss use with a healthcare professional.",
      "Review use with a clinician or pharmacist if taking prescription medicines or before combining with other high-dose supplements.",
    ],
  },
  {
    id: "omega-3",
    name: "Omega-3",
    brand: "Natra-Heal",
    productName: "Omega 3 Capsules",
    description:
      "A fish-oil source of EPA and DHA, essential long-chain omega-3 fatty acids commonly used for general nutritional and cardiovascular wellness support.",
    keyIngredients: [
      "Fish oil extract — 1,000 mg",
      "EPA — 180 mg",
      "DHA — 120 mg",
    ],
    primaryBenefits: [
      "General omega-3 nutritional support",
      "Cardiovascular wellness support",
      "Brain and mood-related nutritional support",
    ],
    interactionsAndCautions: [
      "High doses can affect platelet activity and may matter for people using warfarin or other anticoagulants.",
      "Common side effects include fishy taste, heartburn, nausea, or gastrointestinal discomfort.",
      "Very high-dose omega-3 use should be discussed with a healthcare professional, particularly in people with cardiovascular disease or atrial-fibrillation risk.",
    ],
  },
  {
    id: "lions-mane",
    name: "Lion's Mane",
    brand: "Natra-Heal",
    productName: "Lion's Mane",
    description:
      "A functional mushroom commonly explored for cognitive wellness, focus, and mental clarity.",
    keyIngredients: ["Lion's Mane mushroom (Hericium erinaceus)"],
    primaryBenefits: [
      "Cognitive wellness support",
      "Focus and mental clarity support",
      "General nervous-system wellness support",
    ],
    interactionsAndCautions: [
      "Human evidence and long-term safety data are still limited.",
      "Avoid if you have a known mushroom allergy; stop and seek advice if an allergic reaction occurs.",
      "Review use with a clinician or pharmacist if pregnant, breastfeeding, taking prescription medicines, or managing a significant health condition.",
    ],
  },
];

export const SUPPLEMENT_BY_NAME = new Map(
  SUPPLEMENTS.map((supplement) => [supplement.name.toLowerCase(), supplement]),
);

export function getSupplementByName(name: string): Supplement | undefined {
  return SUPPLEMENT_BY_NAME.get(name.toLowerCase());
}
