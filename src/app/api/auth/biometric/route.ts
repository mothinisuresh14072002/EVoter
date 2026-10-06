import { NextResponse } from "next/server";

const BACKEND_URL = (process.env.BACKEND_INTERNAL_URL || "http://localhost:8000").replace(/\/$/, "");

export async function POST(request: Request) {
  let payload: { reference_session_id?: string; live_session_id?: string };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid verification request." }, { status: 400 });
  }

  if (!payload.reference_session_id || !payload.live_session_id) {
    return NextResponse.json({ error: "Missing verification session." }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${BACKEND_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const result = await upstream.json().catch(() => null);

    if (!upstream.ok || result?.status !== "verified") {
      return NextResponse.json(
        {
          success: false,
          status: result?.status || "failed",
          reason_codes: result?.reason_codes || ["verification_failed"],
        },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      success: true,
      status: "verified",
    });

    response.cookies.set({
      name: "evoter_biometric",
      value: crypto.randomUUID(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 5,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Biometric verification service is unavailable." },
      { status: 503 },
    );
  }
}
