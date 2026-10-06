export const privacyContent = {
  title: "Privacy Notes",
  content: [
    "This is a research prototype, not an official identity or election service.",
    "Use only a non-sensitive reference portrait from a consenting test participant. Do not upload government identity documents.",
    "Reference/live images are held in short-lived in-memory or Redis sessions and are deleted after verification or TTL expiry.",
    "The current backend does not persist face embeddings as user records.",
    "Production privacy claims require independent review of infrastructure, logs, backups, observability, model providers, and applicable law."
  ]
};

export const securityContent = {
  title: "Security Notes",
  content: [
    "The API fails closed when required models are unavailable or liveness, quality, or identity checks do not pass.",
    "A one-time movement challenge is consumed on the first capture attempt to reduce replay.",
    "Production Docker Compose uses Redis-backed short-lived sessions and keeps the FastAPI port bound to localhost on the host.",
    "Model files are external deployment assets and must be licensed, integrity-checked, calibrated, and independently evaluated.",
    "This project does not implement certified election cryptography, a durable tally, or an official voter registry.",
    "Real public-election use requires independent security audits, legal approval, accessibility review, operational controls, and certification."
  ]
};

export const termsContent = {
  title: "Prototype Terms",
  content: [
    "Use this repository only for research, development, testing, and permitted demonstrations.",
    "Do not submit real Aadhaar, DigiLocker, OTP, password, voter ID, passport, or other sensitive credentials or documents.",
    "Do not impersonate another person or use biometric data without their consent.",
    "Do not represent this prototype as an official election, government identity service, or certified voting system.",
    "The demo result is not a legal identity decision and the demo receipt is not an election record."
  ]
};

export const helpContent = {
  title: "Help Centre",
  faqs: [
    {
      q: "What is EVoter?",
      a: "EVoter is a research prototype for testing biometric verification and a non-binding demo voting workflow."
    },
    {
      q: "What reference image should I use?",
      a: "Use a clear front-facing portrait of a consenting test participant. Do not upload a government ID."
    },
    {
      q: "Why did face verification fail?",
      a: "Common reasons include missing model assets, lighting, blur, face size or position, multiple faces, failed liveness, or similarity below the configured threshold."
    },
    {
      q: "What does manual review mean?",
      a: "It is only an API decision state for borderline similarity. This repository does not include a staffed human adjudication workflow."
    },
    {
      q: "Are the thresholds certified?",
      a: "No. They are configuration defaults and must be calibrated and independently validated for any target model and camera environment."
    },
    {
      q: "Can I use this for a real election?",
      a: "Not as-is. The repository intentionally remains a research and demo system."
    }
  ]
};

export const contactContent = {
  title: "Contact",
  emails: [
    { label: "Project support", email: "support@example.com" },
    { label: "Security reports", email: "security@example.com" }
  ]
};
