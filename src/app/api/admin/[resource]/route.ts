import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifySignedSession } from "@/lib/session";

const BACKEND_URL = (process.env.BACKEND_INTERNAL_URL || "http://localhost:8000").replace(/\/$/, "");
const ALLOWED = new Set(["candidates", "tally"]);

async function authorized(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySignedSession(cookieStore.get("evoter_admin")?.value, "admin");
}

function configurationError() {
  return NextResponse.json(
    { error: "Admin backend credentials are not configured." },
    { status: 503 },
  );
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  try {
    if (!(await authorized())) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  } catch {
    return configurationError();
  }

  const { resource } = await context.params;
  if (!ALLOWED.has(resource)) {
    return NextResponse.json({ error: "Unknown admin resource." }, { status: 404 });
  }

  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey) return configurationError();

  try {
    const upstream = await fetch(`${BACKEND_URL}/admin/${resource}`, {
      headers: { "X-Admin-Key": apiKey },
      cache: "no-store",
    });
    const body = await upstream.json().catch(() => ({ error: "Invalid backend response." }));
    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: "Admin backend is unavailable." }, { status: 503 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  try {
    if (!(await authorized())) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  } catch {
    return configurationError();
  }

  const { resource } = await context.params;
  if (resource !== "candidates") {
    return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
  }

  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey) return configurationError();

  const body = await request.json().catch(() => null);
  if (
    !body ||
    ["name", "party", "place", "district"].some(
      (field) => typeof body[field] !== "string" || body[field].trim().length === 0,
    )
  ) {
    return NextResponse.json({ error: "All candidate fields are required." }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${BACKEND_URL}/admin/candidates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Key": apiKey,
      },
      body: JSON.stringify({
        name: body.name.trim().slice(0, 120),
        party: body.party.trim().slice(0, 120),
        place: body.place.trim().slice(0, 120),
        district: body.district.trim().slice(0, 120),
      }),
      cache: "no-store",
    });
    const result = await upstream.json().catch(() => ({ error: "Invalid backend response." }));
    return NextResponse.json(result, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: "Admin backend is unavailable." }, { status: 503 });
  }
}
