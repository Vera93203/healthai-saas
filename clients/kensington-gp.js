/**
 * CLIENT: Kensington Family Practice
 * Type: GP / General Practice
 * Plan: Professional
 */
module.exports = {
  clientId:      "kensington-gp",
  businessName:  "Kensington Family Practice",
  businessType:  "gp_practice",
  assistantName: "Sophie",
  assistantPersona: "a warm and professional GP surgery receptionist",
  plan: "professional",

  contact: {
    address:        "15 Pemberton Road, Kensington, London, W8 6NP",
    phone:          "020 7946 0200",
    email:          "reception@kensingtonfp.nhs.uk",
    website:        "https://kensingtonfp.nhs.uk",
    emergencyPhone: "999",
    urgentPhone:    "111",
    receptionEmail: "reception@kensingtonfp.nhs.uk",
  },

  openingHours: {
    Monday:    { open: "08:00", close: "18:30" },
    Tuesday:   { open: "08:00", close: "18:30" },
    Wednesday: { open: "08:00", close: "18:30" },
    Thursday:  { open: "08:00", close: "18:30" },
    Friday:    { open: "08:00", close: "17:00" },
    Saturday:  { open: "09:00", close: "12:00" },
    Sunday:    { open: null,    close: null },
  },

  booking: {
    system:     "systmonline",
    url:        "https://systmonline.tpp-uk.com/Login?PracticeId=K12345",
    newPatient: "https://kensingtonfp.nhs.uk/register",
    urgent:     null, // urgent — call reception
  },

  services: [
    { name: "GP Appointment",         price: "Free (NHS)", category: "NHS",     duration: "10 mins" },
    { name: "Extended Consultation",  price: "Free (NHS)", category: "NHS",     duration: "20 mins" },
    { name: "Telephone Consultation", price: "Free (NHS)", category: "NHS",     duration: "10 mins" },
    { name: "Nurse Appointment",      price: "Free (NHS)", category: "NHS",     duration: "15 mins" },
    { name: "Travel Vaccination",     price: "From £45",   category: "Private", duration: "15 mins" },
    { name: "Private GP Letter",      price: "From £30",   category: "Private", duration: "N/A" },
    { name: "Health Check",           price: "Free (NHS)", category: "NHS",     duration: "45 mins" },
    { name: "Smear Test",             price: "Free (NHS)", category: "NHS",     duration: "10 mins" },
  ],

  insurance: {
    nhs: true,
    nhsNote: "We are an NHS practice. All registered patients receive free NHS care.",
    private: ["BUPA", "AXA Health", "Aviva"],
    payment: ["NHS — free for registered patients", "Private fees available"],
  },

  ai: {
    model:       "gpt-4o-mini",
    maxTokens:   600,
    temperature: 0.4,
    maxHistory:  12,
    knowledgeDomain: "general_practice",
    customFAQs: [
      { q: "How do I register as a new patient?", a: "You can register online at our website or come in person with proof of address and ID." },
      { q: "How do I get a repeat prescription?", a: "Request online via SystmOnline, or call us 48 hours in advance. Allow 2 working days for processing." },
      { q: "How do I get my test results?", a: "Call after 2pm or log in to SystmOnline. Results take 3-5 working days." },
      { q: "What if I need urgent same-day care?", a: "Call us at 8am for same-day urgent appointments. Outside hours call 111." },
    ],
  },

  safety: {
    blockDiagnosis:   true,
    blockMedication:  true,
    emergencyKeywords: ["chest pain", "difficulty breathing", "stroke", "unconscious", "severe bleeding", "overdose", "suicidal"],
    emergencyResponse: "This sounds like a medical emergency. Please call 999 immediately or go to your nearest A&E.",
    urgentResponse:    "For urgent medical advice, please call 111. For life-threatening emergencies call 999.",
  },

  escalation: {
    failedTurns:    2,
    receptionEmail: "reception@kensingtonfp.nhs.uk",
    receptionPhone: "020 7946 0200",
  },

  channels: { webChat: true, whatsapp: true, voice: true },

  branding: {
    primaryColor:   "#1d4ed8",
    accentColor:    "#60a5fa",
    logoEmoji:      "🏥",
    widgetPosition: "bottom-right",
  },
};
