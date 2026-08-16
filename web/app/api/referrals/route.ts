import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FIELD_LENGTH = 200;

function isSafeString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= MAX_FIELD_LENGTH;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid referral event" }, { status: 400 });
  }

  const event = body as Record<string, unknown>;
  if (
    !isSafeString(event.referral_id) ||
    !isSafeString(event.user_id) ||
    !isSafeString(event.product_id) ||
    !isSafeString(event.timestamp) ||
    Number.isNaN(Date.parse(event.timestamp))
  ) {
    return NextResponse.json({ error: "Invalid referral event" }, { status: 400 });
  }

  const referral = {
    referral_id: event.referral_id,
    user_id: event.user_id,
    product_id: event.product_id,
    timestamp: event.timestamp,
  };

  // Produces a structured server log that can be exported from the hosting
  // platform for commission reporting. No symptom or chat content is logged.
  console.info("redrise_referral_click", JSON.stringify(referral));

  // Optional durable sink for production reporting (database, analytics
  // collector, automation webhook, etc.). This keeps the app independent of a
  // specific vendor while allowing centralized monthly reporting.
  const sinkUrl = process.env.REFERRAL_LOG_ENDPOINT;
  if (sinkUrl) {
    try {
      const response = await fetch(sinkUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(process.env.REFERRAL_LOG_TOKEN
            ? { authorization: `Bearer ${process.env.REFERRAL_LOG_TOKEN}` }
            : {}),
        },
        body: JSON.stringify(referral),
        cache: "no-store",
      });
      if (!response.ok) {
        console.error("redrise_referral_sink_error", response.status);
      }
    } catch (error) {
      console.error("redrise_referral_sink_error", error);
    }
  }

  return NextResponse.json({ ok: true });
}
