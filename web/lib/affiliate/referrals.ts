export const AFFILIATE_DISCLOSURE =
  "We may earn a small commission when you purchase products through links in the app. This does not affect your price.";

const CHECKOUT_BASE = "https://natraheal.com/cart/add";

/**
 * Merchant-facing identifiers for Natra-Heal products.
 * Published SKUs are used where Natra-Heal exposes them publicly. For products
 * whose public page does not expose a SKU, the public product slug is used as
 * the default identifier and can be overridden at deploy time.
 */
const PRODUCT_IDS: Record<string, string> = {
  rhodiola: process.env.NEXT_PUBLIC_NATRAHEAL_RHODIOLA_PRODUCT_ID || "NH_63683",
  "l-tyrosine": process.env.NEXT_PUBLIC_NATRAHEAL_DEPRESSION_ASSIST_PRODUCT_ID || "NH_73829",
  "5-htp": process.env.NEXT_PUBLIC_NATRAHEAL_DEPRESSION_ASSIST_PRODUCT_ID || "NH_73829",
  "magnesium-glycinate": process.env.NEXT_PUBLIC_NATRAHEAL_MAGNESIUM_GLYCINATE_PRODUCT_ID || "NH_56273",
  nac: process.env.NEXT_PUBLIC_NATRAHEAL_NAC_PRODUCT_ID || "nac-n-acetyl-cysteine-capsules",
  "omega-3": process.env.NEXT_PUBLIC_NATRAHEAL_OMEGA3_PRODUCT_ID || "NH_94298",
  "lions-mane": process.env.NEXT_PUBLIC_NATRAHEAL_LIONS_MANE_PRODUCT_ID || "lions-mane",
};

export type ReferralClick = {
  referral_id: string;
  user_id: string;
  product_id: string;
  timestamp: string;
};

export function getMerchantProductId(supplementId: string): string | undefined {
  return PRODUCT_IDS[supplementId];
}

export function buildAffiliateUrl(supplementId: string): string | undefined {
  const productId = getMerchantProductId(supplementId);
  if (!productId) return undefined;

  const url = new URL(CHECKOUT_BASE);
  url.searchParams.set("id", productId);
  url.searchParams.set("qty", "1");
  url.searchParams.set("utm_source", "redrise");
  url.searchParams.set("utm_medium", "app_referral");
  return url.toString();
}

function getOrCreateReferralUserId(): string {
  if (typeof window === "undefined") return "server";
  const key = "redrise_referral_user_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const created =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `rr_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(key, created);
  return created;
}

function persistLocalReferral(event: ReferralClick) {
  if (typeof window === "undefined") return;
  const key = "redrise_referral_clicks";
  try {
    const existing = JSON.parse(window.localStorage.getItem(key) || "[]");
    const events = Array.isArray(existing) ? existing : [];
    events.push(event);
    window.localStorage.setItem(key, JSON.stringify(events.slice(-500)));
  } catch {
    window.localStorage.setItem(key, JSON.stringify([event]));
  }
}

export async function trackReferralClick(productId: string): Promise<ReferralClick> {
  const event: ReferralClick = {
    referral_id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `ref_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    user_id: getOrCreateReferralUserId(),
    product_id: productId,
    timestamp: new Date().toISOString(),
  };

  persistLocalReferral(event);

  try {
    await fetch("/api/referrals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(event),
      keepalive: true,
    });
  } catch {
    // The local ledger is retained so a failed network request does not lose
    // the click event on the user's device.
  }

  return event;
}
