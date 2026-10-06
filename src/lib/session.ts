import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export type SessionPurpose = "voter" | "biometric" | "admin";

type SignedPayload = {
  purpose: SessionPurpose;
  expiresAt: number;
  nonce: string;
};

function getSigningSecret(): string {
  const secret = process.env.SESSION_SIGNING_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SIGNING_SECRET must be configured with at least 32 characters.",
    );
  }

  return secret;
}

function sign(encodedPayload: string): string {
  return createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createSignedSession(
  purpose: SessionPurpose,
  ttlSeconds: number,
): string {
  const payload: SignedPayload = {
    purpose,
    expiresAt: Date.now() + ttlSeconds * 1000,
    nonce: randomUUID(),
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifySignedSession(
  token: string | undefined,
  purpose: SessionPurpose,
): boolean {
  if (!token) return false;

  const [encodedPayload, signature, ...rest] = token.split(".");
  if (!encodedPayload || !signature || rest.length > 0) return false;

  const expected = sign(encodedPayload);
  const suppliedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as SignedPayload;

    return (
      payload.purpose === purpose &&
      Number.isFinite(payload.expiresAt) &&
      payload.expiresAt > Date.now() &&
      typeof payload.nonce === "string" &&
      payload.nonce.length > 0
    );
  } catch {
    return false;
  }
}
