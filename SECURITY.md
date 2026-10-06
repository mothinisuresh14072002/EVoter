# Security Policy

## Supported scope

EVoter is a research/demo application for biometric verification and a non-binding voting-style flow. Security fixes are maintained on the current `main` branch.

This repository is **not** an official election system, voter registry, DigiLocker/Aadhaar integration, or certified biometric platform.

## Reporting a vulnerability

Please do not publish exploit details, sensitive biometric samples, secrets, or personally identifying information in a public issue.

For a security report:

1. Open a GitHub Security Advisory for this repository when the feature is available.
2. Otherwise contact the repository owner privately through the contact method listed on the owner's GitHub profile.
3. Include the affected component, reproduction steps, impact, and a minimal proof of concept that does not contain real identity documents or biometric data.

Do not test against systems, accounts, cameras, or people you do not own or have permission to use.

## Sensitive-data rules

Security reports and test fixtures must not include:

- Aadhaar, voter ID, passport, or other government identity documents
- real election credentials
- private keys, API keys, passwords, cookies, or session tokens
- biometric images or embeddings from non-consenting people
- production Redis/database dumps

Use invented identifiers and consenting test images only.

## Response priorities

High-priority reports include:

- authentication or authorization bypass
- admin access bypass
- session forgery or fixation
- remote code execution
- secret disclosure
- biometric-session data leakage
- unsafe deserialization
- server-side request forgery
- injection vulnerabilities
- a verification path that fails open when models or dependencies fail

## Election-system boundary

A vulnerability fix can improve this demo, but it does not certify EVoter for a binding public election. Real election deployment requires independent security review, election-specific protocol design, privacy/legal review, accessibility validation, operational controls, governance, and relevant certification.
