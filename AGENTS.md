# EVoter Face Verification Agent Instructions

You are helping build a face-verification module for EVoter.

Important safety rules:

1. Do not store Aadhaar photos permanently by default.
2. Do not store live face images permanently by default.
3. Do not store face embeddings permanently by default.
4. Do not connect face-verification data to vote choice.
5. Do not log raw images, image bytes, embeddings, Aadhaar identifiers, or secrets.
6. Use clear reason codes for all verification failures.
7. Build small, testable changes only.
8. Prefer simple MVP code first, then improve.
9. Keep backend and frontend separated.
10. Add or update tests for backend logic.

Backend stack:

1. Python
2. FastAPI
3. Pydantic
4. OpenCV
5. NumPy
6. pytest

Frontend stack:

1. React
2. TypeScript preferred
3. Browser camera APIs for prototype

For every task:

1. Explain what files you changed.
2. Do not introduce unrelated changes.
3. Add tests where practical.
4. Tell me the exact command to run.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
