const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

export interface LiveChallenge {
  challenge_id: string;
  challenge: "turn_left" | "turn_right";
  expires_in_seconds: number;
}

export interface UploadAadhaarResult {
  session_id: string;
  status: string;
  quality_metrics?: Record<string, number>;
  reason_codes?: string[];
}

export interface CaptureLiveResult {
  session_id: string;
  status: string;
  liveness_result?: string | null;
  quality_metrics?: Record<string, number>;
  reason_codes?: string[];
}

export interface VerifyFacesResult {
  status: "verified" | "manual_review" | "failed" | "match" | "no_match" | "reject";
  confidence_score?: number;
  liveness_result?: string;
  quality_metrics?: Record<string, number>;
  reason_codes?: string[];
  processing_time_ms?: number;
}

async function parseResponse<T>(res: Response, action: string): Promise<T> {
  if (!res.ok) {
    try {
      const err = await res.json();
      throw new Error(err?.detail || `${action} failed (${res.status})`);
    } catch (error) {
      if (error instanceof Error && error.message) {
        throw error;
      }
      throw new Error(`${action} failed (${res.status})`);
    }
  }

  return res.json() as Promise<T>;
}

export async function uploadAadhaar(file: File): Promise<UploadAadhaarResult> {
  const formData = new FormData();
  formData.append("file", file);
  return parseResponse<UploadAadhaarResult>(
    await fetch(`${API_BASE}/upload-aadhaar`, {
      method: "POST",
      body: formData,
    }),
    "Upload",
  );
}

export async function createLiveChallenge(): Promise<LiveChallenge> {
  return parseResponse<LiveChallenge>(
    await fetch(`${API_BASE}/live-challenge`, { method: "POST" }),
    "Challenge",
  );
}

export async function captureLive(
  blobs: Blob[],
  challengeId: string,
): Promise<CaptureLiveResult> {
  const formData = new FormData();
  formData.append("challenge_id", challengeId);
  blobs.forEach((blob, index) =>
    formData.append("files", blob, `capture_${index}.jpg`),
  );

  return parseResponse<CaptureLiveResult>(
    await fetch(`${API_BASE}/capture-live`, {
      method: "POST",
      body: formData,
    }),
    "Capture",
  );
}

export async function verifyFaces(
  referenceSessionId: string,
  liveSessionId: string,
): Promise<VerifyFacesResult> {
  return parseResponse<VerifyFacesResult>(
    await fetch(`${API_BASE}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference_session_id: referenceSessionId,
        live_session_id: liveSessionId,
      }),
    }),
    "Verify",
  );
}
