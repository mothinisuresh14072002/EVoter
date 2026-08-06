# EVoter Biometric Privacy & Data Handling

This document outlines the technical specifications of how the EVoter system processes, handles, and protects biometric data during the face verification flow.

> [!NOTE]
> **Disclaimer**: This documentation describes the technical data lifecycle and architecture. It is not a legally binding privacy policy or compliance statement. Any legal claims regarding GDPR, local data protection laws, or compliance must be approved by authorized legal counsel.

## 1. Reference Photo Handling
When a user uploads a reference photo (such as an Aadhaar card photo), the image is transmitted securely to the backend. The backend validates the image against strict quality thresholds (size, resolution, blur, and brightness) and decodes it. If acceptable, the image is held temporarily in a secure, randomized in-memory session.

## 2. Live Face Handling
During the live capture step, the client application may capture and transmit a burst of multiple frames to the backend. The backend analyzes these frames for optimal lighting, face centering, and active liveness (anti-spoofing). Only the single highest-quality frame is selected and placed into the temporary in-memory session; all other frames are immediately discarded.

## 3. Storage and Embeddings
The EVoter architecture is engineered with a strict "privacy-by-design" approach:
- **No Persistent Storage**: Raw image files, face crops, and captured frames are **never** saved to disk or persisted in a database by default.
- **No Biometric Logging**: Mathematical face embeddings, raw image bytes, and Aadhaar identifiers are strictly prohibited from being written to system logs.
- Feature extraction (generating the facial embedding vectors) occurs entirely in volatile RAM solely for the instantaneous cosine similarity calculation.

## 4. Retention and Session Expiry
Biometric data is retained only for the exact duration required to complete the verification handshake:
- Sessions are governed by a strict, configurable Time-To-Live (TTL).
- If a session sits idle and expires, the data becomes permanently inaccessible.
- The moment the final `/verify` endpoint completes its similarity check, both the reference and live session data are explicitly and irreversibly purged from memory.

## 5. Fallback and Manual Review Path
To ensure fairness and accessibility, automated rejections are minimized. If the face models return low similarity scores or if the anti-spoofing logic cannot guarantee liveness, the system defaults to a `manual_review` state rather than an outright rejection. This guarantees that legitimate users always have a fallback path for human verification if the AI pipeline struggles with lighting or edge cases.

## 6. Separation from Vote Choice
Identity verification is an isolated preliminary step to authorize access. The biometric session data and the verification outcomes are entirely segregated from the cryptographic voting mechanism. The system architecture guarantees that face verification data is **never linked** to a user's ballot or specific vote choice.
