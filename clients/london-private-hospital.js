/**
 * CLIENT: London Private Hospital
 * Type: Private Hospital / Specialist Clinic
 * Plan: Enterprise
 */
module.exports = {
  clientId:      "london-private-hospital",
  businessName:  "London Private Hospital",
  businessType:  "private_hospital",
  assistantName: "Victoria",
  assistantPersona: "a highly professional and discreet private hospital patient coordinator",
  plan: "enterprise",

  contact: {
    address:        "120 Harley Street, London, W1G 7JW",
    phone:          "020 7946 0500",
    email:          "enquiries@londonprivatehospital.co.uk",
    website:        "https://londonprivatehospital.co.uk",
    emergencyPhone: "999",
    urgentPhone:    "020 7946 0999",
    receptionEmail: "admissions@londonprivatehospital.co.uk",
    conciergeEmail: "concierge@londonprivatehospital.co.uk",
  },

  openingHours: {
    Monday:    { open: "07:00", close: "21:00" },
    Tuesday:   { open: "07:00", close: "21:00" },
    Wednesday: { open: "07:00", close: "21:00" },
    Thursday:  { open: "07:00", close: "21:00" },
    Friday:    { open: "07:00", close: "21:00" },
    Saturday:  { open: "08:00", close: "18:00" },
    Sunday:    { open: "08:00", close: "16:00" },
  },

  booking: {
    system:     "custom",
    url:        "https://londonprivatehospital.co.uk/book",
    newPatient: "https://londonprivatehospital.co.uk/new-patient",
    urgent:     "https://londonprivatehospital.co.uk/urgent",
  },

  services: [
    { name: "Outpatient Consultation",  price: "From £250",    category: "Specialist",    duration: "30-60 mins" },
    { name: "General Surgery",          price: "From £3,500",  category: "Surgery",       duration: "Varies" },
    { name: "Orthopaedic Surgery",      price: "From £5,000",  category: "Surgery",       duration: "Varies" },
    { name: "Cardiology Consultation",  price: "From £300",    category: "Cardiology",    duration: "45 mins" },
    { name: "Oncology Services",        price: "On enquiry",   category: "Oncology",      duration: "Varies" },
    { name: "MRI Scan",                 price: "From £600",    category: "Diagnostics",   duration: "45 mins" },
    { name: "CT Scan",                  price: "From £400",    category: "Diagnostics",   duration: "20 mins" },
    { name: "Blood Tests",              price: "From £80",     category: "Diagnostics",   duration: "15 mins" },
    { name: "Physiotherapy",            price: "From £90",     category: "Therapy",       duration: "45 mins" },
    { name: "Private GP",              price: "From £180",    category: "General",       duration: "20 mins" },
    { name: "Executive Health Check",   price: "From £1,200",  category: "Preventative",  duration: "Half day" },
    { name: "Fertility Consultation",   price: "From £250",    category: "Fertility",     duration: "45 mins" },
  ],

  insurance: {
    nhs: false,
    nhsNote: "We are a private hospital. We do not accept NHS referrals directly.",
    private: ["BUPA", "AXA Health", "Vitality", "Aviva", "Cigna", "WPA", "Healix", "Allianz", "Aetna", "International SOS"],
    payment: ["All major credit/debit cards", "Bank transfer", "International wire transfer", "Medical finance available"],
  },

  ai: {
    model:       "gpt-4o-mini",
    maxTokens:   700,
    temperature: 0.35,
    maxHistory:  14,
    knowledgeDomain: "private_hospital",
    customFAQs: [
      { q: "Do I need a GP referral?", a: "For most specialist consultations you can self-refer. Some insurers may require a GP letter — we can advise based on your insurer." },
      { q: "Do you accept international patients?", a: "Absolutely. We have a dedicated international patient team and can arrange travel, accommodation, and translation services." },
      { q: "How quickly can I be seen?", a: "Most outpatient consultations can be arranged within 24-48 hours. Urgent cases can often be seen same day." },
      { q: "How do I use my health insurance?", a: "Call your insurer for pre-authorisation before your appointment. We work directly with all major UK and international insurers." },
    ],
  },

  safety: {
    blockDiagnosis:   true,
    blockMedication:  true,
    emergencyKeywords: ["chest pain", "heart attack", "stroke", "severe bleeding", "unconscious", "can't breathe"],
    emergencyResponse: "This is a medical emergency. Please call 999 immediately.",
  },

  escalation: {
    failedTurns:    1, // enterprise — faster escalation
    receptionEmail: "admissions@londonprivatehospital.co.uk",
    receptionPhone: "020 7946 0500",
  },

  channels: { webChat: true, whatsapp: true, voice: true },

  branding: {
    primaryColor:   "#0f2c4a",
    accentColor:    "#c9a84c",
    logoEmoji:      "🏨",
    widgetPosition: "bottom-right",
  },
};
