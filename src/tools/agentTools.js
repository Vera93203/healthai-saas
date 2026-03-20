/**
 * Universal Agent Tools
 * ─────────────────────
 * Works for any healthcare client type.
 */

const nodemailer = require("nodemailer");

const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "search_web",
      description: "Search the web for current information: NHS guidelines, health advice, clinic comparisons, treatment costs, waiting times, local services, or any question needing up-to-date facts.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query — be specific" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "collect_patient_info",
      description: "Save patient details shared during conversation. Call IMMEDIATELY when patient mentions their name, phone, email, or appointment preferences.",
      parameters: {
        type: "object",
        properties: {
          name:             { type: "string",  description: "Patient full name" },
          phone:            { type: "string",  description: "Phone number" },
          email:            { type: "string",  description: "Email address" },
          isNewPatient:     { type: "boolean", description: "First time at this clinic?" },
          preferredService: { type: "string",  description: "What they want help with" },
          preferredTime:    { type: "string",  description: "When they'd like to come in" },
          concern:          { type: "string",  description: "Medical or health concern mentioned" },
          severity:         { type: "string",  description: "How severe 1-10 if mentioned" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_booking_link",
      description: "Get the right booking link based on urgency. Use: emergency=life-threatening, urgent=needs seeing soon, routine=standard appointment, new=first visit, consultation=pricing/info meeting.",
      parameters: {
        type: "object",
        properties: {
          appointmentType: {
            type: "string",
            enum: ["new", "returning", "urgent", "emergency", "routine", "consultation", "existing", "follow-up"],
            description: "Type of appointment needed",
          },
          reason: { type: "string", description: "Brief reason for the appointment" },
        },
        required: ["appointmentType"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_email",
      description: "Send email. Use for: booking confirmations to patient, escalation alerts to reception, or enquiry summaries.",
      parameters: {
        type: "object",
        properties: {
          to:      { type: "string", description: "Recipient email" },
          subject: { type: "string", description: "Subject line" },
          body:    { type: "string", description: "Email body text" },
          type:    { type: "string", enum: ["confirmation", "escalation", "summary"], description: "Email type" },
        },
        required: ["to", "subject", "body", "type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_opening_hours",
      description: "Check if the clinic is open today, tomorrow, or on a specific day.",
      parameters: {
        type: "object",
        properties: {
          day: { type: "string", description: "Day to check: 'today', 'tomorrow', or day name like 'Saturday'" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Create a follow-up task for the reception team: callback request, follow-up reminder, or any action needed.",
      parameters: {
        type: "object",
        properties: {
          task:     { type: "string", description: "What needs to be done" },
          priority: { type: "string", enum: ["low", "normal", "urgent"], description: "Priority level" },
          patient:  { type: "string", description: "Patient name" },
          contact:  { type: "string", description: "Phone or email" },
          notes:    { type: "string", description: "Additional notes" },
        },
        required: ["task", "priority"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "escalate_to_human",
      description: "Escalate to human receptionist. Use when: patient asks for a human, patient is distressed, question is too complex, or after repeated failed attempts to help.",
      parameters: {
        type: "object",
        properties: {
          reason:  { type: "string", description: "Why escalating" },
          urgency: { type: "string", enum: ["low", "medium", "high"], description: "Urgency level" },
        },
        required: ["reason", "urgency"],
      },
    },
  },
];

// ── Tool Executor ─────────────────────────────────────────────────────────────

async function executeTool(toolName, args, context) {
  const { client, session } = context;

  switch (toolName) {
    case "search_web":           return await searchWeb(args.query);
    case "collect_patient_info": return collectPatientInfo(args, session);
    case "get_booking_link":     return getBookingLink(args.appointmentType, args.reason, client);
    case "send_email":           return await sendEmail(args, client);
    case "check_opening_hours":  return checkOpeningHours(args.day, client);
    case "create_task":          return createTask(args, client);
    case "escalate_to_human":    return escalateToHuman(args, client, session);
    default: return { error: `Unknown tool: ${toolName}` };
  }
}

// ── Implementations ───────────────────────────────────────────────────────────

async function searchWeb(query) {
  try {
    if (process.env.SERPAPI_KEY && !process.env.SERPAPI_KEY.includes("your_")) {
      const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${process.env.SERPAPI_KEY}&num=3&gl=uk&hl=en`;
      const res = await fetch(url);
      const data = await res.json();
      const results = (data.organic_results || []).slice(0, 3).map(r => ({
        title: r.title, snippet: r.snippet, url: r.link,
      }));
      return { success: true, results, source: "serpapi" };
    }
    // Free fallback
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url);
    const data = await res.json();
    const answer = data.AbstractText || data.Answer || data.Definition || "";
    return {
      success: true,
      results: answer ? [{ title: data.AbstractSource || "Result", snippet: answer, url: data.AbstractURL || "" }] : [],
      source: "duckduckgo",
      note: "Limited results — add SERPAPI_KEY for better search",
    };
  } catch (err) {
    return { success: false, error: "Search unavailable", fallback: "Use your general knowledge to answer." };
  }
}

function collectPatientInfo(args, session) {
  const { updatePatient } = require("../memory/sessionMemory");
  if (session?.id) updatePatient(session.id, args);
  const saved = Object.keys(args).filter(k => args[k] !== undefined && args[k] !== null && args[k] !== "");
  return { success: true, saved, message: `Saved: ${saved.join(", ")}` };
}

function getBookingLink(appointmentType, reason, client) {
  const type = (appointmentType || "").toLowerCase();
  const urgentTypes    = ["urgent", "emergency", "same-day", "sameday", "asap"];
  const newTypes       = ["new", "first", "first-time", "new-patient"];

  let linkKey = "url";
  if (urgentTypes.some(t => type.includes(t))) linkKey = "urgent";
  else if (newTypes.some(t => type.includes(t))) linkKey = "newPatient";

  const url = client.booking?.[linkKey] || client.booking?.url;
  const labels = { url: "Standard appointment", newPatient: "New patient booking", urgent: "Urgent appointment" };

  return {
    success: true,
    url: url || null,
    label: labels[linkKey] || "Appointment booking",
    phone: client.contact.phone,
    reason: reason || "",
    note: url ? `Share this link: ${url}` : `No online booking — please call ${client.contact.phone}`,
  };
}

async function sendEmail(args, client) {
  try {
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes("your@")) {
      console.log(`[EMAIL SIMULATED]\nTo: ${args.to}\nSubject: ${args.subject}\n${args.body}`);
      return { success: true, simulated: true, message: "Email logged (add EMAIL_USER to .env for real emails)" };
    }
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || client.contact.email,
      to: args.to,
      subject: args.subject,
      text: args.body,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;padding:20px;color:#1e293b">
        <h2 style="color:#1a5f7a;border-bottom:2px solid #57c5b6;padding-bottom:8px">${client.businessName}</h2>
        <pre style="white-space:pre-wrap;font-family:Arial;font-size:14px;line-height:1.6">${args.body}</pre>
        <hr style="border-color:#e2e8f0"/>
        <small style="color:#94a3b8">Sent by ${client.assistantName}, AI Assistant at ${client.businessName}</small>
      </div>`,
    });
    return { success: true, message: `Email sent to ${args.to}` };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function checkOpeningHours(day, client) {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const now = new Date();
  const todayName = days[now.getDay()];
  const target = !day || day.toLowerCase() === "today" ? todayName
    : day.toLowerCase() === "tomorrow" ? days[(now.getDay() + 1) % 7]
    : Object.keys(client.openingHours || {}).find(d => d.toLowerCase() === day.toLowerCase()) || day;

  const hours = client.openingHours?.[target];
  if (!hours?.open) return { day: target, isOpen: false, status: "Closed", currentlyOpen: false };

  const [oh, om] = hours.open.split(":").map(Number);
  const [ch, cm] = hours.close.split(":").map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const currentlyOpen = target === todayName && nowMins >= oh * 60 + om && nowMins < ch * 60 + cm;

  return { day: target, hours: `${hours.open}–${hours.close}`, isOpen: true, currentlyOpen, opensAt: hours.open, closesAt: hours.close };
}

function createTask(args, client) {
  const task = { id: `TASK-${Date.now()}`, created: new Date().toLocaleString("en-GB"), ...args, clinic: client.businessName };
  console.log(`[TASK CREATED]`, JSON.stringify(task, null, 2));
  // Send to reception
  sendEmail({
    to: client.escalation?.receptionEmail || client.contact.receptionEmail,
    subject: `[${(args.priority || "normal").toUpperCase()} TASK] ${args.task}`,
    body: `New task from AI Assistant:\n\nTask: ${args.task}\nPriority: ${args.priority}\nPatient: ${args.patient || "Unknown"}\nContact: ${args.contact || "Not provided"}\nNotes: ${args.notes || "None"}\nCreated: ${task.created}`,
    type: "escalation",
  }, client).catch(() => {});
  return { success: true, taskId: task.id, message: `Task created: ${args.task}` };
}

function escalateToHuman(args, client, session) {
  session.escalated = true;
  const p = session?.patient || {};
  const summary = [
    `Business: ${client.businessName}`,
    `Patient: ${p.name || "Unknown"} | Phone: ${p.phone || "N/A"} | Email: ${p.email || "N/A"}`,
    `Concern: ${p.concern || p.preferredService || "Not specified"}`,
    `Reason for escalation: ${args.reason}`,
    `Urgency: ${args.urgency}`,
    `Turns: ${session.turnCount || 0}`,
  ].join("\n");

  sendEmail({
    to: client.escalation?.receptionEmail,
    subject: `[${args.urgency.toUpperCase()} ESCALATION] ${p.name || "Patient"} — ${args.reason.slice(0, 50)}`,
    body: `AI Assistant has escalated a conversation:\n\n${summary}`,
    type: "escalation",
  }, client).catch(() => {});

  return {
    success: true,
    message: "Escalated to reception team",
    contact: { phone: client.contact.phone, email: client.contact.email },
  };
}

module.exports = { TOOL_DEFINITIONS, executeTool };
