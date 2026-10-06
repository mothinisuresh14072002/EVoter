# EVoter

EVoter is an open **research/demo prototype** for studying a biometric verification pipeline and a non-binding voting-style user journey.

It is **not** connected to DigiLocker, Aadhaar, UIDAI, the Election Commission of India, or another government service, and it is **not suitable for a real public election as-is**.

## What is implemented

- Next.js 16 research-demo portal
- FastAPI biometric verification API
- separate Vite biometric development harness
- one-time left/right camera movement challenge
- bounded multi-frame live capture
- SCRFD ONNX output decoding + NMS
- five-point ArcFace-style face alignment when landmarks are available
- configurable embedding similarity thresholds
- configurable liveness class/threshold semantics
- fail-closed verification decisions: `verified`, `manual_review`, `failed`
- short-lived memory or Redis biometric sessions
- safe JSON/compressed-array Redis serialization (no pickle deserialization)
- signed short-lived voter, biometric, and admin web sessions
- server-side admin proxy; backend admin key is never exposed to browser code
- Docker Compose deployment with Redis and backend readiness gating
- GitHub Actions for Next.js, Vite, backend tests, and production Docker builds

## What is intentionally not implemented

This repository does **not** provide:

- an official voter registry
- DigiLocker/Aadhaar authentication
- a production election tally
- certified ballot encryption or end-to-end verifiability
- coercion resistance
- election key ceremonies
- official receipt proofs
- a staffed manual-review workflow
- biometric/election certification

The demo ballot uses fictional candidates. The selected candidate is kept in the browser; the server receives only an opaque demo submission token and returns a clearly labeled demo receipt.

## Architecture

```text
Browser
  |
  v
Next.js demo portal :3000
  |-- signed demo voter/admin sessions
  |-- /api/biometric/*  (server-side proxy)
  |-- /api/auth/biometric
  |-- /api/admin/*      (server-side admin proxy)
  |
  v
FastAPI biometric API :8000 (localhost-bound on Docker host)
  |-- /upload-reference
  |-- /live-challenge
  |-- /capture-live
  |-- /verify
  |-- /health
  |-- /ready
  |
  +--> Redis (short-lived sessions)
  |
  +--> external ONNX model assets
```

The separate `frontend/` Vite app is a developer-facing harness for exercising the biometric API directly. Docker Compose serves the Next.js portal, not the Vite harness.

## Required model assets

Model binaries are intentionally not committed. Put deployment-approved files in:

```text
backend/models/
├── scrfd_500m.onnx
├── adaface_ir50.onnx
└── silent_face.onnx
```

The detector supports common InsightFace SCRFD exports with 6 outputs (scores + boxes) or 9 outputs (scores + boxes + five landmarks).

The embedding and liveness files must match the preprocessing/output assumptions configured for your deployment. In particular, validate:

- embedding input/output geometry and normalization
- `LIVENESS_REAL_CLASS_INDEX`
- `LIVENESS_LIVE_THRESHOLD`
- `LIVENESS_SPOOF_THRESHOLD`
- face-match thresholds
- camera/domain performance and presentation attacks

Do not treat the default thresholds as certified operating points.

## Fastest reproducible demo deployment

Prerequisites:

- Docker Engine / Docker Desktop
- Docker Compose
- the three approved ONNX model files above

### 1. Clone

```bash
git clone https://github.com/mothinisuresh14072002/EVoter.git
cd EVoter
```

### 2. Create environment files

Linux/macOS:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
```

Generate strong values:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Use separate strong values in root `.env` for:

- `SESSION_SIGNING_SECRET` — at least 32 characters
- `ADMIN_UI_PASSWORD` — at least 12 characters
- `ADMIN_API_KEY` — long random secret

Docker Compose passes root `ADMIN_API_KEY` to FastAPI, so the browser never receives it.

### 3. Add model files

Copy the three model files into `backend/models/`.

### 4. Validate Compose configuration

```bash
docker compose config
```

Compose refuses to start if required root secrets are missing.

### 5. Start

```bash
docker compose up --build -d
```

### 6. Check health/readiness

```bash
docker compose ps
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/ready
```

Expected readiness when models + Redis are available:

```json
{
  "status": "ready",
  "session_store": true,
  "models": {
    "face_detection": true,
    "face_embedding": true,
    "liveness": true
  }
}
```

Open the demo portal at:

```text
http://localhost:3000
```

Browser camera APIs generally require HTTPS outside localhost.

## Local development without Docker

### Next.js portal

Copy `.env.example` to `.env.local`, configure strong secrets, and keep:

```text
BACKEND_INTERNAL_URL=http://localhost:8000
EVOTER_DEMO_MODE=true
```

Then:

```bash
npm ci
npm run dev
```

### FastAPI backend

From the repository root:

Linux/macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
export SESSION_STORE_BACKEND=memory
uvicorn backend.main:app --reload --port 8000
```

Windows PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
$env:SESSION_STORE_BACKEND="memory"
uvicorn backend.main:app --reload --port 8000
```

For production-like multi-worker/multi-instance behavior, use Redis instead of the memory session store.

### Vite biometric harness

```bash
cd frontend
npm ci
```

Copy `frontend/.env.example` to `frontend/.env`, then:

```bash
npm run dev
```

The Vite harness calls FastAPI directly and therefore relies on the backend CORS allowlist.

## Main biometric API

### `POST /upload-reference`

Accepts a temporary, non-sensitive reference portrait. The service requires exactly one detectable, acceptable-quality face before creating a short-lived session.

Legacy alias `/upload-aadhaar` remains for compatibility but should not be used in new code.

### `POST /live-challenge`

Creates a short-lived, one-time movement challenge.

### `POST /capture-live`

Requires the challenge ID and 3–12 image frames. The production UI captures 8 frames. The challenge is consumed immediately on the first capture attempt.

### `POST /verify`

Consumes reference/live sessions and returns one of:

- `verified`
- `manual_review`
- `failed`

Both biometric sessions are deleted after the verification request, including failure paths.

### `GET /health`

Process liveness only.

### `GET /ready`

Checks Redis (when configured) and presence of all required model files. Docker Compose uses this endpoint before starting the frontend.

## Security model

Important implemented controls:

- fail closed on missing/failed biometric models
- one-time temporal challenge
- bounded frame count
- image validation and quality gates
- five-point face alignment where landmarks are available
- multi-frame liveness and embedding aggregation
- short session TTLs
- Redis production session option
- safe non-executable Redis serialization
- signed HTTP-only, SameSite=Strict demo cookies
- server-only admin API key
- backend host binding to `127.0.0.1` in Compose
- baseline browser headers
- generated artifacts/dependencies removed from Git
- CI validation for both frontend applications, backend tests, and Docker builds

Before exposing a demo publicly, also add:

- HTTPS
- reverse-proxy/platform rate limiting
- secret rotation and managed secret storage
- centralized monitoring without biometric payload logging
- dependency/container vulnerability scanning
- model checksums/signatures and provenance controls
- backups/incident response appropriate to the deployment
- independent penetration testing

These measures make a stronger **demo deployment**. They do not turn EVoter into a certified election platform.

## Tests

```bash
npm run lint
npm run build

cd frontend
npm run build
cd ..

pytest backend/tests -q
```

CI additionally builds both production Docker images.

## Project status

EVoter should be described as:

> A research prototype for biometric verification and a non-binding voting-style demonstration.

Do not describe it as an official government application, certified biometric system, or production public-election platform.
