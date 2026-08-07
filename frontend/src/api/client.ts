const API_BASE = 'http://127.0.0.1:8000';

export interface UploadAadhaarResult {
  session_id: string;
  status: string;
  quality_metrics?: Record<string, number>;
  reason_codes?: string[];
}

export interface CaptureLiveResult {
  session_id: string;
  status: string;
  liveness_result?: Record<string, unknown>;
  quality_metrics?: Record<string, number>;
  reason_codes?: string[];
}

export interface VerifyFacesResult {
  status: 'verified' | 'manual_review' | 'failed' | 'match' | 'no_match';
  confidence_score?: number;
  liveness_result?: Record<string, unknown>;
  quality_metrics?: Record<string, number>;
  reason_codes?: string[];
  processing_time_ms?: number;
}

export async function uploadAadhaar(file: File): Promise<UploadAadhaarResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload-aadhaar`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    try {
      const err = await res.json();
      throw new Error(err?.detail || `Upload failed (${res.status})`);
    } catch {
      throw new Error(`Upload failed (${res.status})`);
    }
  }
  return res.json();
}

export async function captureLive(blobs: Blob[]): Promise<CaptureLiveResult> {
  const formData = new FormData();
  blobs.forEach((blob, i) => {
    formData.append('files', blob, `capture_${i}.jpg`);
  });

  const res = await fetch(`${API_BASE}/capture-live`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    try {
      const err = await res.json();
      throw new Error(err?.detail || `Capture failed (${res.status})`);
    } catch {
      throw new Error(`Capture failed (${res.status})`);
    }
  }
  return res.json();
}

export async function verifyFaces(
  referenceSessionId: string,
  liveSessionId: string
): Promise<VerifyFacesResult> {
  const res = await fetch(`${API_BASE}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reference_session_id: referenceSessionId,
      live_session_id: liveSessionId,
    }),
  });
  if (!res.ok) {
    try {
      const err = await res.json();
      throw new Error(err?.detail || `Verify failed (${res.status})`);
    } catch {
      throw new Error(`Verify failed (${res.status})`);
    }
  }
  return res.json();
}
