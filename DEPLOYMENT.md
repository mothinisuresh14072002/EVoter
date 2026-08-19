# EVoter Deployment Guide

This document describes how to deploy EVoter locally with Docker Compose and how to prepare for a production deployment.

---

## Prerequisites

- Docker Engine 24+ with Docker Compose v2
- The ONNX model files referenced below (obtained, licensed, and integrity-checked)

### Required Model Files

| Variable | Default Path |
|---|---|
| `FACE_DETECTION_MODEL_PATH` | `models/scrfd_500m.onnx` |
| `FACE_EMBEDDING_MODEL_PATH` | `models/adaface_ir50.onnx` |
| `LIVENESS_MODEL_PATH` | `models/silent_face.onnx` |

Place the model files on the host and mount them into the backend container via the `models` Docker volume (see `docker-compose.yml`).

---

## Quick Start (Docker Compose)

### 1. Clone and build

```bash
git clone https://github.com/mothinisuresh14072002/EVoter.git
cd EVoter
```

### 2. Configure environment

```bash
cp .env.production.example .env.production
```

Edit `.env.production` to set the correct `NEXT_PUBLIC_BACKEND_URL` and `CORS_ORIGINS` for your deployment.

### 3. Start the stacks

```bash
docker compose up -d
```

Containers will be available at:

| Service | URL |
|---|---|
| Frontend (Next.js) | http://localhost:3000 |
| Backend (FastAPI) | http://localhost:8000 |
| OpenAPI UI | http://localhost:8000/docs |
| Health check | http://localhost:8000/health |

### 4. Verify

```bash
curl http://localhost:8000/health
# Expected: {"status":"ok"}
```

### 5. Stop

```bash
docker compose down
```

---

## Local Development (without Docker)

### Frontend

```bash
npm install
npm run dev
# http://localhost:3000
```

### Backend

```bash
python -m venv .venv
.venv\Scripts\activate      # Windows
source .venv/bin/activate  # macOS / Linux
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
# http://localhost:8000
```

Create a `.env` file in the project root (see `.env.example`) to override defaults during development.

---

## Production Considerations

Before deploying to a real environment, address the following:

| Area | Action |
|---|---|
| **Reverse proxy** | Place Nginx or a managed load balancer in front of both services; terminate TLS at the proxy |
| **Secrets management** | Do not commit `.env.production`; use a secrets manager (e.g., Docker secrets, AWS SSM, Vault) |
| **CORS** | Restrict `CORS_ORIGINS` to your production frontend domain only |
| **Rate limiting** | Add IP- and token-based rate limiting (e.g., via Nginx `limit_req` or an API gateway) |
| **API authentication** | Add authenticated API access with short-lived tokens to all verification endpoints |
| **Model integrity** | Verify checksums/signatures of `.onnx` model files before deployment |
| **Logging** | Ensure no raw images, embeddings, Aadhaar identifiers, or secrets are logged |
| **Session cleanup** | The backend already runs a background task that clears expired sessions every 60 seconds; verify TTL settings |
| **Persistence** | If candidate/tally state must survive restarts, back the `admin_store` with a database; the current in-memory store is ephemeral |

---

## CI / CD

GitHub Actions workflows live in `.github/workflows/`. The default workflow (`ci.yml`) runs on every push and pull request:

- **Frontend**: `npm ci` → `npm run lint` → `npm run build`
- **Backend**: install system + Python deps → `pytest backend/tests -q`

To add deployment automation, extend `ci.yml` or create a new workflow that builds and pushes images to your registry, then deploys via `docker compose pull && docker compose up -d`.

---

## Container Reference

| Container | Base Image | Entrypoint |
|---|---|---|
| Frontend | `node:20-alpine` | `npx next start` on port 3000 |
| Backend | `python:3.12-slim` | `uvicorn backend.main:app` on port 8000 |

Both images are built from the repository root using the `Dockerfile` (frontend) and `backend/Dockerfile` (backend).

The backend `Dockerfile` installs the minimal system libraries required by `opencv-python` and runs as a non-root user (`app`).
