/**
 * /api/chat — safety preflight plus streaming proxy to the HF backend.
 * Mental-health crisis language is handled deterministically before the
 * model so urgent help never depends on LLM classification.
 */

import { NextRequest } from "next/server";
import { buildCrisisResponse, hasMentalHealthCrisisSignal } from "@/lib/wellness/crisis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_BACKEND = "https://ruslanmv-medibot.hf.space";
const DEFAULT_TIMEOUT_MS = 50_000;

function resolveBackendURL(): string {
  const raw = process.env.HF_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND;
  return raw.replace(/\/+$/, "");
}

export async function POST(req: NextRequest): Promise<Response> {
  const bodyText = await req.text();

  // Deterministic mental-health red flag. This runs before any model or
  // upstream dependency. It intentionally targets explicit self-harm /
  // suicide / inability-to-stay-safe language rather than ordinary low mood.
  try {
    const payload = JSON.parse(bodyText);
    const messages = Array.isArray(payload?.messages) ? payload.messages : [];
    const lastUser = [...messages].reverse().find((message: any) => message?.role === "user");
    const text = typeof lastUser?.content === "string" ? lastUser.content : "";
    if (text && hasMentalHealthCrisisSignal(text)) {
      const country = payload?.context?.country;
      const emergencyNumber = country === "ZA" ? "112" : payload?.context?.emergencyNumber;
      return crisisSse(buildCrisisResponse(country, emergencyNumber));
    }
  } catch {
    // Invalid JSON is allowed to continue to the upstream, which will return
    // the canonical request error. Safety detection must not break the proxy.
  }

  const backend = resolveBackendURL();
  const upstream = `${backend}/api/chat`;
  const startedAt = Date.now();
  console.log(`[Proxy] /api/chat → ${upstream} (${bodyText.length}B in)`);

  const timeoutMs = Number(process.env.HF_BACKEND_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  req.signal?.addEventListener("abort", () => controller.abort(), { once: true });

  let res: Response;
  try {
    res = await fetch(upstream, {
      method: "POST",
      headers: buildForwardHeaders(req),
      body: bodyText,
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timer);
    const aborted = err?.name === "AbortError";
    return jsonError(
      aborted ? "The RedRise assistant took too long to respond. Please try again." : "Could not reach the RedRise assistant. Please try again.",
      aborted ? "backend_timeout" : "backend_unreachable",
      aborted ? 504 : 502,
    );
  }
  clearTimeout(timer);

  const upstreamContentType = res.headers.get("content-type") || "";
  console.log(`[Proxy] ${upstream} → ${res.status} (${Date.now() - startedAt}ms TTFB)`);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return jsonError(
      `The RedRise assistant returned an error (${res.status}). Please try again in a moment.`,
      "backend_error",
      res.status >= 500 ? 502 : res.status,
      { upstreamStatus: res.status, upstreamBody: text.slice(0, 500) },
    );
  }

  if (!res.body) return new Response("data: [DONE]\n\n", { status: 200, headers: sseHeaders() });

  return new Response(res.body, {
    status: 200,
    headers: { ...sseHeaders(), "Content-Type": upstreamContentType || "text/event-stream" },
  });
}

export async function GET(): Promise<Response> {
  return new Response("Method Not Allowed — use POST", { status: 405 });
}

function crisisSse(content: string): Response {
  const frame = JSON.stringify({
    choices: [{ delta: { content } }],
    provider: "redrise-safety",
    model: "deterministic-crisis-triage",
  });
  return new Response(`data: ${frame}\n\ndata: [DONE]\n\n`, { status: 200, headers: sseHeaders() });
}

function buildForwardHeaders(req: NextRequest): HeadersInit {
  const out: Record<string, string> = { "Content-Type": "application/json", Accept: "text/event-stream" };
  const cookie = req.headers.get("cookie");
  if (cookie) out.Cookie = cookie;
  const acceptLang = req.headers.get("accept-language");
  if (acceptLang) out["Accept-Language"] = acceptLang;
  const realIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
  if (realIp) out["X-Forwarded-For"] = realIp;
  return out;
}

function sseHeaders(): Record<string, string> {
  return { "Content-Type": "text/event-stream", "Cache-Control": "no-store", Connection: "keep-alive" };
}

function jsonError(message: string, code: string, status: number, extra?: Record<string, unknown>): Response {
  return new Response(JSON.stringify({ error: message, code, ...(extra ?? {}) }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
