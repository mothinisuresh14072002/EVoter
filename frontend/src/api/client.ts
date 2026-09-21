const API_BASE = 'http://192.168.1.183:8000';
export interface LiveChallenge { challenge_id: string; challenge: 'turn_left' | 'turn_right'; expires_in_seconds: number; }
export interface UploadAadhaarResult { session_id: string; status: string; quality_metrics?: Record<string, number>; reason_codes?: string[]; }
export interface CaptureLiveResult { session_id: string; status: string; liveness_result?: string | null; quality_metrics?: Record<string, number>; reason_codes?: string[]; }
export interface VerifyFacesResult { status: 'verified' | 'manual_review' | 'failed' | 'match' | 'no_match'; confidence_score?: number; liveness_result?: string; quality_metrics?: Record<string, number>; reason_codes?: string[]; processing_time_ms?: number; }

async function parseResponse(res: Response, action: string) {
  if (!res.ok) { try { const err = await res.json(); throw new Error(err?.detail || `${action} failed (${res.status})`); } catch (e) { if (e instanceof Error && e.message) throw e; throw new Error(`${action} failed (${res.status})`); } }
  return res.json();
}
export async function uploadAadhaar(file: File): Promise<UploadAadhaarResult> { const fd=new FormData(); fd.append('file',file); return parseResponse(await fetch(`${API_BASE}/upload-aadhaar`,{method:'POST',body:fd}),'Upload'); }
export async function createLiveChallenge(): Promise<LiveChallenge> { return parseResponse(await fetch(`${API_BASE}/live-challenge`,{method:'POST'}),'Challenge'); }
export async function captureLive(blobs: Blob[], challengeId: string): Promise<CaptureLiveResult> { const fd=new FormData(); fd.append('challenge_id',challengeId); blobs.forEach((b,i)=>fd.append('files',b,`capture_${i}.jpg`)); return parseResponse(await fetch(`${API_BASE}/capture-live`,{method:'POST',body:fd}),'Capture'); }
export async function verifyFaces(referenceSessionId: string, liveSessionId: string): Promise<VerifyFacesResult> { return parseResponse(await fetch(`${API_BASE}/verify`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reference_session_id:referenceSessionId,live_session_id:liveSessionId})}),'Verify'); }
