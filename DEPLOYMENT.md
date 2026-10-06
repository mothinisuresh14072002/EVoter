# EVoter Demo Deployment Guide

## Scope

This guide deploys EVoter as a **research/demo application**.

It does not make the repository suitable for a binding public election. Do not present a hosted instance as an official government service, voter registry, DigiLocker/Aadhaar integration, or certified election system.

## Recommended topology

```text
Internet
  |
 HTTPS + rate limiting
  |
Reverse proxy / hosting edge
  |
  v
Next.js :3000
  |
  +---- internal HTTP ----> FastAPI :8000
                            |
                            +--> Redis
                            +--> ONNX model files
```

In Docker Compose, FastAPI is bound to `127.0.0.1:8000` on the host. Redis is not published.

## 1. Server prerequisites

Recommended baseline:

- Linux server or Docker-capable host
- Docker Engine
- Docker Compose v2
- HTTPS-capable reverse proxy or hosting edge for non-local browser-camera use
- sufficient CPU/RAM for the selected ONNX models

Check:

```bash
docker --version
docker compose version
```

## 2. Clone

```bash
git clone https://github.com/mothinisuresh14072002/EVoter.git
cd EVoter
```

## 3. Create configuration files

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Generate random secrets:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

Put separate values into root `.env`:

```text
EVOTER_DEMO_MODE=true
SESSION_SIGNING_SECRET=<at-least-32-random-characters>
ADMIN_UI_PASSWORD=<strong-unique-password>
ADMIN_API_KEY=<long-random-api-key>
BACKEND_INTERNAL_URL=http://localhost:8000
```

Docker Compose overrides `BACKEND_INTERNAL_URL` to `http://backend:8000` inside the frontend container and passes the root `ADMIN_API_KEY` to FastAPI.

Do not commit either `.env` file.

## 4. Configure backend

The provided `backend/.env.example` is production/Compose oriented:

```text
ENABLE_VOTE_MOCK=false
SESSION_TTL_SECONDS=300
SESSION_STORE_BACKEND=redis
REDIS_URL=redis://redis:6379/0
```

Keep `ENABLE_VOTE_MOCK=false` for normal demo deployments.

Set `CORS_ORIGINS` only to origins that actually need direct FastAPI access. The production Next.js portal uses a server-side proxy, so public browsers do not need direct backend access.

## 5. Install model assets

Place approved model files at:

```text
backend/models/scrfd_500m.onnx
backend/models/adaface_ir50.onnx
backend/models/silent_face.onnx
```

Model files are intentionally excluded from Git and Docker build context; Compose mounts them read-only at runtime.

The exact models must be validated against the implementation assumptions. At minimum verify:

- SCRFD output layout
- embedding input/output and normalization
- liveness class ordering
- liveness thresholds
- similarity thresholds
- accuracy across expected cameras, lighting, demographics, and presentation attacks

## 6. Validate configuration

```bash
docker compose config
```

If a required root secret is missing, Compose should fail before starting.

## 7. Build and start

```bash
docker compose up --build -d
```

Inspect:

```bash
docker compose ps
docker compose logs --tail=200 backend
docker compose logs --tail=200 frontend
docker compose logs --tail=100 redis
```

## 8. Health and readiness

Liveness check:

```bash
curl http://127.0.0.1:8000/health
```

Readiness check:

```bash
curl -i http://127.0.0.1:8000/ready
```

`/ready` returns HTTP 503 until Redis is reachable and all three configured model files exist.

The frontend service waits for backend readiness before starting.

## 9. Open locally

```text
http://localhost:3000
```

Use invented demo credentials only.

For biometric testing, use a non-sensitive portrait from a consenting test participant. Do not use Aadhaar cards, voter IDs, passports, or other official identity documents.

## 10. Public demo exposure

Outside localhost, browser camera access normally requires HTTPS.

Expose **only the Next.js application** through your public reverse proxy. Do not publicly expose Redis. Keep FastAPI private or localhost-bound unless you have a specific controlled integration need.

Minimum reverse-proxy controls:

- HTTPS
- request/body-size limits
- rate limiting for `/api/`
- sensible connection/read timeouts
- security logging that excludes request bodies
- no caching of authentication/biometric API responses

Example Nginx configuration is provided at `deploy/nginx.evoter.conf.example`.

## 11. Deployment validation checklist

Before publishing a demo URL, confirm:

- [ ] `docker compose config` succeeds
- [ ] `docker compose ps` reports healthy backend/Redis
- [ ] `GET /ready` returns HTTP 200
- [ ] Next.js page loads through HTTPS
- [ ] camera permission works in the target browser
- [ ] demo login rejects malformed inputs
- [ ] direct `/vote` access redirects to verification
- [ ] biometric proxy rejects requests without a signed voter session
- [ ] failed movement/liveness/similarity does not set biometric authorization
- [ ] successful verification opens the fictional demo ballot
- [ ] submitting the demo ballot clears voter + biometric cookies
- [ ] receipt is explicitly labeled non-binding
- [ ] admin UI contains no browser-visible backend API key
- [ ] FastAPI port is not internet-exposed
- [ ] Redis is not internet-exposed
- [ ] secrets are not present in Git or logs
- [ ] model licenses/provenance/checksums are recorded outside the repository
- [ ] external rate limiting is enabled

## 12. Updates

From the repository directory:

```bash
git pull --ff-only
docker compose build --pull
docker compose up -d
docker compose ps
```

Then re-run `/ready` and the smoke checklist.

## 13. Stop / rollback

Stop:

```bash
docker compose down
```

Show Git history:

```bash
git log --oneline -10
```

To roll back application code, checkout a known tested commit/tag and rebuild. Do not delete Redis/session data as a substitute for a controlled rollback.

## Production-election boundary

A technically healthy demo deployment is **not** equivalent to an election-ready system.

A real binding election would require, among other things, independently reviewed election cryptography/protocols, voter-roll integration, coercion-resistance analysis, accessibility and usability validation, privacy/legal review, secure key management, immutable/auditable operational controls, disaster recovery, formal certification, independent penetration testing, election-authority governance, and validated biometric performance.

That work is outside the scope of this repository.
