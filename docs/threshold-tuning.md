# Face Verification Threshold Tuning

## Current MVP Thresholds
The system uses three strict boundaries for classification, controlled by environment variables in the configuration:

- **MATCH_THRESHOLD**: (Default: `0.85`). Scores equal to or strictly above this are automatically accepted as a `'match'`.
- **MANUAL_REVIEW_THRESHOLD**: (Default: `0.70`). Scores falling strictly between this and the `MATCH_THRESHOLD` require human review (`'manual_review'`).
- **Reject**: Scores falling strictly below the `MANUAL_REVIEW_THRESHOLD` are automatically classified as `'reject'`.

## Important Disclaimer: Not Production Ready
> [!WARNING]
> **DO NOT use these default thresholds in a live production environment.**
> The current default values (0.85 and 0.70) are placeholder MVP values intended solely for local testing, early backend scaffolding, and UI integration development. 

## How to Tune for Production
When deploying to staging or production, these thresholds **must** be calibrated against a statistically significant dataset that accurately represents your actual target demographic and camera hardware conditions.

1. **Collect Data**: Gather a test set of genuine matching pairs and non-matching impostor pairs under realistic lighting/camera conditions.
2. **Extract Features**: Generate all embeddings using the exact finalized ONNX model (e.g., AdaFace IR50) deployed in production.
3. **Analyze**: Compute the False Acceptance Rate (FAR) and False Rejection Rate (FRR) across different threshold sliders.
4. **Select**: Lock in thresholds that strictly satisfy the business risk profile and legal requirements for FAR vs. FRR for the EVoter platform.
