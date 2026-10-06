import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("evoter_session");
  const biometric = cookieStore.get("evoter_biometric");

  return NextResponse.json({
    authenticated: Boolean(session),
    biometricVerified: Boolean(session && biometric),
  });
}
