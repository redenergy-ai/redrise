import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = new Set(["correction"]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const type = typeof body?.type === "string" ? body.type : "";
    const details = typeof body?.details === "string" ? body.details.trim() : "";
    const userId = typeof body?.user_id === "string" ? body.user_id : "";

    if (!ALLOWED_TYPES.has(type)) {
      return NextResponse.json({ error: "Unsupported privacy request type" }, { status: 400 });
    }
    if (!userId || !details) {
      return NextResponse.json({ error: "user_id and details are required" }, { status: 400 });
    }

    const requestId = `privacy_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const record = {
      request_id: requestId,
      type,
      user_id: userId,
      details,
      timestamp: new Date().toISOString(),
      status: "received",
    };

    // Placeholder audit sink. Replace with a durable privacy-request store/ticketing
    // integration before production. Do not log health/chat data here.
    console.info("[privacy-request]", JSON.stringify(record));

    const endpoint = process.env.PRIVACY_REQUEST_ENDPOINT;
    if (endpoint) {
      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.PRIVACY_REQUEST_TOKEN
            ? { Authorization: `Bearer ${process.env.PRIVACY_REQUEST_TOKEN}` }
            : {}),
        },
        body: JSON.stringify(record),
        cache: "no-store",
      }).catch(() => undefined);
    }

    return NextResponse.json({ ok: true, request_id: requestId });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
