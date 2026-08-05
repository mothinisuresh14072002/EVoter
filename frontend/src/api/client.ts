const API_BASE = 'http://127.0.0.1:8000';

export async function uploadAadhaar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_BASE}/upload-aadhaar`, {
        method: 'POST',
        body: formData,
    });
    return res.json();
}

export async function captureLive(fileOrBlob: Blob | File) {
    const formData = new FormData();
    formData.append('file', fileOrBlob, 'capture.jpg');
    
    const res = await fetch(`${API_BASE}/capture-live`, {
        method: 'POST',
        body: formData,
    });
    return res.json();
}

export async function verifyFaces(referenceSessionId: string, liveSessionId: string) {
    const res = await fetch(`${API_BASE}/verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            reference_session_id: referenceSessionId,
            live_session_id: liveSessionId
        }),
    });
    return res.json();
}
