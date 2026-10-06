import { NextResponse } from "next/server";

const BACKEND_URL = (process.env.BACKEND_INTERNAL_URL || "http://localhost:8000").replace(/\/$/, "");

const ACTIONS: Record<string, string> = {
  reference: "/upload-reference",
  challenge: "/live-challenge",
  capture: "/capture-live",
};

export async function POST(
  request: Request,
  context: { params: Promise<{ action: string }> },
) {
  const { action } = await context.params;
  const backendPath = ACTIONS[action];

  if (!backendPath) {
    return NextResponse.json({ error: "Unknown biometric action." }, { status: 404 });
  }

  try {
    let upstream: Response;

    if (action === "challenge") {
      upstream = await fetch(`${BACKEND_URL}${backendPath}`, {
        method: "POST",
        cache: "no-store",
      });
    } else {
      const formData = await request.formData();
      upstream = await fetch(`${BACKEND_URL}${backendPath}`, {
        method: "POST",
        body: formData,
        cache: "no-store",
      });
    }

    const body = await upstream.json().catch(() => ({
      detail: "Biometric service returned an invalid response.",
    }));

    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { error: "Biometric service is unavailable." },
      { status: 503 },
    );
  }
}
