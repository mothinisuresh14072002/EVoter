# EVoter Biometric Verification Security

This document outlines the security architecture and explicit production hardening requirements for the EVoter facial verification module.

> [!WARNING]
> **Status: Not Production Ready**
> The current biometric verification pipeline is an MVP designed exclusively for integration and testing. It **MUST NOT** be deployed to a live production environment until it has undergone comprehensive third-party security audits, penetration testing, and compliance certification.

## 1. Session Expiry & Ephemeral State
The module mitigates persistent data risk by utilizing short-lived, volatile session states:
- **Cryptographic IDs**: Uploaded images generate a cryptographically secure, randomized session token.
- **Strict Expiry (TTL)**: All sessions are governed by a strict Time-To-Live countdown. 
- **Immediate Purge**: Regardless of success or failure, the biometric session data is definitively purged from memory the moment a verification cycle concludes or the TTL is breached.

## 2. Safe Logging Practices
Biometric markers are highly sensitive data. The application strictly enforces safe logging:
- **No Image Logging**: Raw image payloads are never written to application or system logs.
- **No Vector Logging**: Mathematical face embeddings and facial bounding boxes are stripped from trace outputs.
- **No Identity Traces**: Aadhaar numbers or identifying keys are never dumped to the console.
- Only operational telemetry (e.g., processing latency, final boolean status, or generic reason codes like `low_similarity`) is permitted in the logging pipeline.

## 3. Strict Decoupling of Identity and Ballot Choice
The fundamental security axiom of the EVoter architecture is absolute anonymity. This biometric module functions strictly as a preliminary identity gate. The module is engineered such that it **must not** possess any connection, token, or database link that ties a verified identity to a specific vote or ballot choice.

---

## Future Production Hardening Needs
Before this system can safely handle real voters, the following operational safeguards must be fully implemented:

### 4. Model File Integrity Checks
Currently, the ONNX model files are loaded directly from the local filesystem. To prevent supply-chain or local tampering attacks, a production release must validate the cryptographic checksums (e.g., SHA-256 hashing) of the `scrfd_500m.onnx`, `adaface_ir50.onnx`, and `silent_face.onnx` binaries during server initialization.

### 5. API Access Control
The biometric API endpoints (`/upload-aadhaar`, `/capture-live`, `/verify`) currently lack perimeter defense. Prior to production, these routes must be secured behind a strict API gateway demanding valid, short-lived JWTs (JSON Web Tokens) tied to an established, authenticated user session.

### 6. Rate Limiting and DoS Protection
Computer vision and DNN inferences are computationally expensive. Without safeguards, the server is extremely vulnerable to resource-exhaustion Denial-of-Service (DoS) attacks. Production deployments must deploy aggressive rate limiting (both IP-based and token-based) on all image upload endpoints to neutralize automated flood attacks and brute-forcing.
