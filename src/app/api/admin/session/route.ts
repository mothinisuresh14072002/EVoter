import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createSignedSession, verifySignedSession } from "@/lib/session";

function passwordMatches(supplied: string, expected: string): boolean {
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);

  return (
    suppliedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(suppliedBuffer, expectedBuffer)
  );
}

export async function GET() {
  const cookieStore = await cookies();

  try {
    return NextResponse.json({
      authenticated: verifySignedSession(
        cookieStore.get("evoter_admin")?.value,
        "admin",
      ),
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const expected = process.env.ADMIN_UI_PASSWORD;
  if (!expected || expected.length < 12) {
    return NextResponse.json(
      { error: "Admin UI password is not configured." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const supplied = typeof body?.password === "string" ? body.password : "";

  if (!passwordMatches(supplied, expected)) {
    return NextResponse.json({ error: "Invalid admin password." }, { status: 401 });
  }

  try {
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: "evoter_admin",
      value: createSignedSession("admin", 60 * 30),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 30,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Admin session signing is not configured." },
      { status: 503 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("evoter_admin");
  return response;
}
