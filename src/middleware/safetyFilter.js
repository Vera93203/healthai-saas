/**
 * Universal Safety Filter
 * Works for any healthcare business type.
 */

const MEDICAL_ADVICE_PATTERNS = [
  /diagnos(e|is|ed)\s+me/i,
  /what\s+(medication|medicine|antibiotic|painkiller)\s+should\s+i\s+take/i,
  /should\s+i\s+take\s+(ibuprofen|paracetamol|amoxicillin|metronidazole|penicillin)/i,
  /what\s+is\s+my\s+(diagnosis|prognosis|condition)/i,
  /do\s+i\s+have\s+(cancer|diabetes|heart\s+disease|infection|abscess|cavity|tumour)/i,
  /how\s+much\s+(medication|medicine|drug|dose)\s+should\s+i\s+take/i,
  /what\s+dosage\s+should/i,
  /can\s+you\s+(diagnose|examine|prescribe)/i,
  /what\s+treatment\s+do\s+i\s+need\s+for\s+my\s+specific/i,
];

const PII_PATTERNS = [
  /\b\d{3}\s?\d{3}\s?\d{4}\b/,       // NHS number
  /\b(?:\d{4}[\s-]?){3}\d{4}\b/,     // credit card
  /\b\d{2}-?\d{2}-?\d{2}\b/,         // sort code
];

function safetyCheck(message, client, session) {
  const text = message.trim();

  // 1. Client-specific emergency keywords
  const emergencyKeywords = client.safety?.emergencyKeywords || [
    "severe pain", "can't breathe", "difficulty breathing",
    "chest pain", "unconscious", "uncontrolled bleeding",
    "knocked out tooth", "facial swelling", "stroke",
  ];

  for (const keyword of emergencyKeywords) {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      const emergencyResponse = client.safety?.emergencyResponse ||
        `This sounds like it needs urgent attention. Please call ${client.contact?.emergencyPhone || "999"} immediately. For life-threatening emergencies call 999.`;
      return { blocked: true, intent: "emergency", response: `⚠️ ${emergencyResponse}` };
    }
  }

  // 2. Medical advice requests — only block personal diagnosis/prescription requests
  for (const p of MEDICAL_ADVICE_PATTERNS) {
    if (p.test(text)) {
      const specialist = client.businessType === "gp_practice" ? "doctor"
        : client.businessType === "dental_clinic" ? "dentist" : "specialist";
      return {
        blocked: true,
        intent: "medical_advice",
        response: `That's really a question for one of our ${specialist}s — I wouldn't want to guess and steer you wrong! I can get you booked in so they can properly assess you.\n\n📅 Book: ${client.booking?.url || client.contact?.phone}`,
      };
    }
  }

  // 3. PII detection
  for (const p of PII_PATTERNS) {
    if (p.test(text)) {
      return {
        blocked: true,
        intent: "pii_detected",
        response: `For your security, please don't share sensitive details like NHS numbers or card numbers here. Our team can take these securely over the phone on ${client.contact?.phone}.`,
      };
    }
  }

  return { blocked: false };
}

module.exports = { safetyCheck };
