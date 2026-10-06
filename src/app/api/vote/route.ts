import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifySignedSession } from "@/lib/session";

export async function POST(request: Request) {
  if (process.env.EVOTER_DEMO_MODE !== "true") {
    return NextResponse.json(
      { error: "Demo voting is disabled on this deployment." },
      { status: 503 },
    );
  }

  const cookieStore = await cookies();

  try {
    const voterSessionValid = verifySignedSession(
      cookieStore.get("evoter_session")?.value,
      "voter",
    );
    const biometricSessionValid = verifySignedSession(
      cookieStore.get("evoter_biometric")?.value,
      "biometric",
    );

    if (!voterSessionValid) {
      return NextResponse.json(
        { error: "No valid demo voter session." },
        { status: 401 },
      );
    }

    if (!biometricSessionValid) {
      return NextResponse.json(
        { error: "Biometric verification is required before opening the demo ballot." },
        { status: 403 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Demo session signing is not configured." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const ballotToken = body?.ballotToken;

  if (typeof ballotToken !== "string" || ballotToken.length < 16 || ballotToken.length > 128) {
    return NextResponse.json({ error: "Invalid demo ballot token." }, { status: 400 });
  }

  // This endpoint intentionally does not implement real election tallying. It only
  // demonstrates one-time authorization and receipt issuance without receiving a
  // candidate identifier.
  const response = NextResponse.json({
    success: true,
    mode: "demo",
    receiptId: "R-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
  });

  response.cookies.delete("evoter_session");
  response.cookies.delete("evoter_biometric");
  return response;
}
