import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifySignedSession } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();

  try {
    const authenticated = verifySignedSession(
      cookieStore.get("evoter_session")?.value,
      "voter",
    );
    const biometricVerified =
      authenticated &&
      verifySignedSession(cookieStore.get("evoter_biometric")?.value, "biometric");

    return NextResponse.json({ authenticated, biometricVerified });
  } catch {
    return NextResponse.json(
      { authenticated: false, biometricVerified: false },
      { status: 503 },
    );
  }
}
