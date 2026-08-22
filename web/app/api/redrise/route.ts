import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, phase } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "query" field' },
        { status: 400 }
      );
    }

    // Call the RedRise FastAPI microservice
    const redriseUrl = process.env.REDRISE_API_URL || 'http://localhost:8000';
    const response = await fetch(`${redriseUrl}/api/redrise/rag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, phase }),
      signal: AbortSignal.timeout(15000), // 15 seconds timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('RedRise API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'RedRise service returned an error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('RedRise proxy error:', error);
    // Graceful fallback
    return NextResponse.json({
      answer: 'I am currently unable to connect to the RedRise service. Please try again later or check that the local server is running.',
      phase: 'error',
      confidence: 0,
      clarification: 'The RedRise service is unavailable.',
    }, { status: 503 });
  }
}
