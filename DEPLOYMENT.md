# EVoter deployment guide

## Important scope

EVoter is a research/MVP prototype. The configuration in this repository is suitable for demonstrating the application and repeatable technical deployments. It does **not** make the project suitable for conducting a real public election. Real election use requires independent security review, legal/compliance approval, accessibility validation, operational controls, and a formal threat model.

## Option 1: Docker Compose

### 1. Prepare environment files

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
```

For a remote frontend, change `CORS_ORIGINS` in `backend/.env` to the exact frontend origin, for example:

```text
CORS_ORIGINS=https://your-domain.example
```

Do not use `*` when credentials are enabled.

### 2. Add the required model files

Place deployment-approved model files under:

```text
backend/models/
```

The default configuration expects:

```text
scrfd_500m.onnx
adaface_ir50.onnx
silent_face.onnx
```

These files are intentionally ignored by Git. Verify their licenses and integrity before deployment.

### 3. Start

```bash
docker compose up --build -d
```

Check status:

```bash
docker compose ps
curl http://localhost:8000/health
```

View logs:

```bash
docker compose logs -f
```

Stop:

```bash
docker compose down
```

## Option 2: Separate hosting

You can deploy the frontend and backend independently.

### Frontend

Build command:

```bash
npm ci && npm run build
```

Start command:

```bash
npm run start
```

The repository's Next.js configuration uses standalone output for container deployment.

### Backend

Install:

```bash
pip install -r backend/requirements.txt
```

Start:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

Set all runtime values using environment variables rather than committing `.env` files.

## Before exposing a public URL

- Set `CORS_ORIGINS` to the exact frontend domain.
- Serve traffic over HTTPS through the hosting platform or a reverse proxy.
- Keep model files and secrets outside Git.
- Verify `/health` after deployment.
- Review logs to ensure biometric images, embeddings, Aadhaar identifiers, and secrets are not emitted.
- Add authenticated API access and rate limiting before any real external use.

## CI

GitHub Actions runs frontend lint/build and backend tests on pushes and pull requests. A deployment should not be promoted until those checks pass.
