/**
 * CLIENT: Bright Smile Dental
 * Type: Dental Clinic
 * Plan: Professional
 */
module.exports = {
  // ── Identity ──────────────────────────────────────────────────────
  clientId:      "brightsmile-dental",
  businessName:  "Bright Smile Dental",
  businessType:  "dental_clinic",
  assistantName: "Aria",
  assistantPersona: "a friendly and professional dental receptionist",
  plan: "professional", // starter | professional | enterprise

  // ── Contact ───────────────────────────────────────────────────────
  contact: {
    address:        "42 High Street, Kensington, London, W8 4PT",
    phone:          "020 7946 0001",
    email:          "hello@brightsmile-dental.co.uk",
    website:        "https://brightsmile-dental.co.uk",
    emergencyPhone: "020 7946 0999",
    receptionEmail: "reception@brightsmile-dental.co.uk",
  },

  // ── Hours ─────────────────────────────────────────────────────────
  openingHours: {
    Monday:    { open: "08:30", close: "18:00" },
    Tuesday:   { open: "08:30", close: "18:00" },
    Wednesday: { open: "08:30", close: "20:00" },
    Thursday:  { open: "08:30", close: "18:00" },
    Friday:    { open: "08:30", close: "17:00" },
    Saturday:  { open: "09:00", close: "14:00" },
    Sunday:    { open: null,    close: null },
  },

  // ── Booking ───────────────────────────────────────────────────────
  booking: {
    system:      "calendly",
    url:         "https://calendly.com/brightsmile/appointment",
    newPatient:  "https://calendly.com/brightsmile/new-patient",
    urgent:      "https://calendly.com/brightsmile/urgent",
  },

  // ── Services ──────────────────────────────────────────────────────
  services: [
    { name: "NHS Check-up",       price: "£26.80",    category: "NHS",     duration: "30 mins" },
    { name: "NHS Filling",        price: "£73.50",    category: "NHS",     duration: "45 mins" },
    { name: "Teeth Whitening",    price: "From £350", category: "Private", duration: "30 mins" },
    { name: "Invisalign",         price: "From £2,500",category:"Private", duration: "Consultation" },
    { name: "Dental Implant",     price: "From £1,800",category:"Private", duration: "Multiple" },
    { name: "Emergency Appt",     price: "From £80",  category: "Mixed",   duration: "30 mins" },
  ],

  // ── Insurance & Payment ───────────────────────────────────────────
  insurance: {
    nhs: true,
    nhsNote: "We accept NHS patients subject to availability.",
    private: ["BUPA", "AXA Health", "Vitality", "Aviva", "Cigna"],
    payment: ["Cash", "Card", "Bank Transfer", "0% finance over £500"],
  },

  // ── AI Behaviour ──────────────────────────────────────────────────
  ai: {
    model:       "gpt-4o-mini",
    maxTokens:   600,
    temperature: 0.4,
    maxHistory:  12,
    // Domain-specific knowledge for this client type
    knowledgeDomain: "dental",
    // Custom FAQs — add anything specific to this clinic
    customFAQs: [
      { q: "Do you offer payment plans?", a: "Yes, we offer 0% finance on treatments over £500. Ask reception for details." },
      { q: "How do I cancel an appointment?", a: "Please call us at least 24 hours in advance on 020 7946 0001." },
      { q: "Is there parking?", a: "Yes, there is pay-and-display parking on High Street and a car park 2 minutes walk away." },
    ],
  },

  // ── Safety Rules ──────────────────────────────────────────────────
  safety: {
    blockDiagnosis:   true,
    blockMedication:  true,
    emergencyKeywords: ["severe pain", "knocked out tooth", "facial swelling", "can't open mouth", "difficulty breathing"],
  },

  // ── Escalation ────────────────────────────────────────────────────
  escalation: {
    failedTurns:      2,
    receptionEmail:   "reception@brightsmile-dental.co.uk",
    receptionPhone:   "020 7946 0001",
  },

  // ── Channels ──────────────────────────────────────────────────────
  channels: {
    webChat:   true,
    whatsapp:  true,
    voice:     true,
  },

  // ── Branding (for widget) ──────────────────────────────────────────
  branding: {
    primaryColor:   "#1a5f7a",
    accentColor:    "#57c5b6",
    logoEmoji:      "🦷",
    widgetPosition: "bottom-right",
  },
};
