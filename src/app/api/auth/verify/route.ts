import { NextResponse } from "next/server";

import { createSignedSession } from "@/lib/session";

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/auth/demo", request.url));
}

export async function POST(request: Request) {
  if (process.env.EVOTER_DEMO_MODE !== "true") {
    return NextResponse.json(
      { error: "Demo authentication is disabled on this deployment." },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const voterCode = String(formData.get("voter_code") || "").trim();
  const demoPin = String(formData.get("demo_pin") || "").trim();

  if (!/^[A-Za-z0-9_-]{4,32}$/.test(voterCode) || !/^\d{6}$/.test(demoPin)) {
    return NextResponse.json(
      { error: "Enter a 4–32 character demo voter code and a 6-digit demo PIN." },
      { status: 400 },
    );
  }

  try {
    const response = NextResponse.json({ success: true, mode: "demo" });

    response.cookies.set({
      name: "evoter_session",
      value: createSignedSession("voter", 60 * 15),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 15,
      path: "/",
    });

    response.cookies.delete("evoter_biometric");
    return response;
  } catch {
    return NextResponse.json(
      { error: "Demo session signing is not configured." },
      { status: 503 },
    );
  }
}
