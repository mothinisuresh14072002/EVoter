# Contributing to EVoter

EVoter welcomes improvements that strengthen the research/demo application while preserving its safety and scope.

## Before making changes

Please keep these project rules intact:

- describe EVoter as a research/demo prototype, not an official or certified election system
- do not add fake government integrations or imply DigiLocker/Aadhaar/UIDAI/Election Commission connectivity
- do not commit real identity documents, biometric samples, secrets, model binaries, or private datasets
- keep biometric sessions short-lived and fail closed on model/configuration errors
- keep ballot selection logically separated from identity verification
- do not expose backend admin keys to browser code

## Local validation

From the repository root:

```bash
npm ci
npm run lint
npm run build
pytest backend/tests -q
docker build -t evoter-frontend:test .
docker build -f backend/Dockerfile -t evoter-backend:test .
```

For the separate biometric frontend:

```bash
cd frontend
npm ci
npm run build
```

A pull request should keep these checks passing.

## Pull requests

A good pull request should explain:

- what problem it solves
- what security/privacy behavior changes
- how it was tested
- whether environment variables or deployment steps changed
- any new limitations or assumptions

Small, focused changes are easier to review.

## Biometric changes

Changes to liveness, face detection, alignment, embeddings, thresholds, or matching logic should include regression tests and should not claim accuracy or certification without measured evidence for the exact model, camera domain, and operating point.

## User experience

Prefer accessible controls, clear error messages, mobile-friendly layouts, and plain language. The demo must clearly distinguish simulated election behavior from a real binding election.
