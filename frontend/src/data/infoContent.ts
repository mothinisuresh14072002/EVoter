export const privacyContent = {
  title: "Privacy Policy",
  content: [
    "EVoter may process identity verification data, DigiLocker or Aadhaar-related verification data, phone/email if used, verification status, device/session metadata, and audit metadata.",
    "EVoter does not collect raw phone fingerprint data.",
    "EVoter does not receive raw lockscreen biometric data.",
    "Face verification is only for identity proofing.",
    "Face-verification data must not be linked to vote choice.",
    "Raw face images and embeddings are not stored by default unless legally required and approved.",
    "Candidate choice must not be stored together with voter identity."
  ]
};

export const securityContent = {
  title: "Security",
  content: [
    "Phone fingerprint data stays on the device.",
    "EVoter receives only local biometric success or failure where supported.",
    "Identity proofing data must not be linked to vote choice.",
    "Face images and embeddings are not stored by default.",
    "Ballots should be encrypted and audit logs should be protected.",
    "EVoter is not unhackable.",
    "Production public elections require independent audit, legal approval, and certification.",
    "Security reports can go to security@example.com."
  ]
};

export const termsContent = {
  title: "Terms and Conditions",
  content: [
    "This is prototype text and needs legal review.",
    "Users must use EVoter only for permitted purposes.",
    "Users must not impersonate another voter.",
    "Users must not upload fake documents.",
    "Users must not coerce, buy, sell, or force votes.",
    "Users must not spoof face verification, use replay attacks, phish users, attack the system, scrape data, or bypass controls.",
    "Remote voting for binding public elections requires official approval.",
    "Support contact is support@example.com."
  ]
};

export const helpContent = {
  title: "Help Centre",
  faqs: [
    { q: "What is EVoter?", a: "EVoter is a secure, verifiable remote voting system." },
    { q: "How do I verify my identity?", a: "You verify your identity using official documents via DigiLocker, followed by a live biometric check." },
    { q: "Why do I need DigiLocker verification?", a: "DigiLocker ensures that your identity is tied to an official government record." },
    { q: "Does EVoter store my fingerprint?", a: "No. EVoter does not store raw phone fingerprint data." },
    { q: "Why did face verification fail?", a: "Face verification can fail because of lighting, blur, multiple faces, camera permission, or liveness failure." },
    { q: "How do I improve camera lighting?", a: "Ensure you are in a well-lit area with the light source in front of you." },
    { q: "What if my phone camera does not work?", a: "You will need a device with a functioning camera to complete verification." },
    { q: "What if I cannot use fingerprint or face verification?", a: "Please contact the election authority for alternative arrangements." },
    { q: "How do I know my vote was submitted?", a: "You will receive a cryptographic voting receipt." },
    { q: "Can anyone see who I voted for?", a: "No. Identity proofing data must not be linked to vote choice." },
    { q: "What should I do if someone is forcing me to vote?", a: "If someone is forcing the voter, they should leave the voting flow and contact official support or election authority." },
    { q: "How do I report a problem?", a: "Use the Contact section. Users should not be told how to bypass verification." },
    { q: "What happens if the app is down?", a: "Wait and try again later; election systems are continuously monitored." }
  ]
};

export const contactContent = {
  title: "Contact",
  emails: [
    { label: "Support", email: "support@example.com" },
    { label: "Privacy", email: "privacy@example.com" },
    { label: "Security", email: "security@example.com" }
  ]
};
