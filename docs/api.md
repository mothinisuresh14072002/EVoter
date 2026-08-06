# EVoter Biometric Identity-Proofing API Contract

This document strictly defines the integration contract between the standalone Face Verification Service and the main EVoter application. 

## 1. Data Minimization Principles
The integration explicitly follows a strict data-minimization architecture:
- **No Raw Images**: The EVoter application will never receive raw image bytes, facial crops, or file URLs.
- **No Biometric Embeddings**: The EVoter application will not receive, process, or persist mathematical facial embeddings.
- **No Aadhaar Identifiers**: The Face Verification Service does not return the user's Aadhaar number.
- **No Ballot Linkage**: The EVoter architecture ensures that the biometric verification state is an isolated preliminary authorization step. This identity state **must never** be connected, attached, or recorded alongside a user's candidate or ballot choice.

## 2. Verification Contract

### `POST /verify`

The main EVoter application initiates verification by passing temporary session pointers.

#### Request Payload
```json
{
  "reference_session_id": "string",
  "live_session_id": "string"
}
```

#### Response Payload
The module guarantees a strictly typed `VerifyResponse` object.

```json
{
  "request_id": "string",
  "status": "verified | manual_review | failed",
  "confidence_score": 0.89,
  "liveness_result": "live | spoof | uncertain",
  "quality_metrics": {
    "blur_score": 125.4,
    "brightness": 130.1
  },
  "reason_codes": [
    "low_similarity_or_spoof"
  ],
  "processing_time_ms": 450.2
}
```

#### Status Enums Explained
To keep the EVoter logic clean, the service collapses complex internal logic into three guaranteed states:
- **`verified`**: The user confidently passed both the cosine similarity threshold and the anti-spoofing (liveness) checks.
- **`manual_review`**: The AI could not conclusively verify the user (e.g., borderline similarity, questionable liveness, or poor lighting). The user should be routed to a human operator queue.
- **`failed`**: The verification catastrophically failed (e.g., no face detected in the image, session expired, or corrupt payload).

*Note: The EVoter platform primarily utilizes the `status`, `request_id`, and `reason_codes` to determine user routing. Telemetry such as `confidence_score` and `quality_metrics` are provided for temporary auditability but should not be permanently linked to voter identities.*
