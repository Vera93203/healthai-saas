const express = require("express");
const rateLimit = require("express-rate-limit");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const { runAgent } = require("../agents/coreAgent");
const { loadClient } = require("../config/clientLoader");

// Fix for Railway proxy
const limiter = rateLimit({
  windowMs: 60*1000,
  max: 30,
  validate: { xForwardedForHeader: false }
});

function validate(req, res, next) {
  const { message, clientId } = req.body;
  if (!message || typeof message !== "string" || !message.trim())
    return res.status(400).json({ error: "Message required." });
  if (message.length > 1500)
    return res.status(400).json({ error: "Message too long." });
  const id = clientId || req.body.clinicId;
  if (!id || !/^[a-z0-9-]+$/.test(id))
    return res.status(400).json({ error: "Valid clientId required." });
  req.body.clientId = id;
  req.body.sessionId = req.body.sessionId || uuidv4();
  next();
}

router.post("/chat", limiter, validate, async (req, res) => {
  const { message, sessionId, clientId } = req.body;
  const client = loadClient(clientId);
  if (!client) return res.status(404).json({ error: `Client '${clientId}' not found.` });
  try {
    const result = await runAgent(sessionId, message, client, "web");
    res.json({ response: result.text, sessionId: result.sessionId, toolsUsed: result.toolsUsed || [], latencyMs: result.latencyMs, patient: result.patient || {} });
  } catch (err) {
    console.error("[ROUTE ERROR]", err.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

router.get("/client/:clientId", (req, res) => {
  const client = loadClient(req.params.clientId);
  if (!client) return res.status(404).json({ error: "Client not found." });
  res.json({
    clientId: client.clientId,
    businessName: client.businessName || client.clinicName,
    businessType: client.businessType || "healthcare",
    assistantName: client.assistantName,
    contact: client.contact,
    branding: client.branding || {},
    channels: client.channels || {},
  });
});

router.get("/health", (req, res) => {
  const hasGroq = !!(process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes("your_"));
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  res.json({
    status: "ok", version: "3.0.0",
    ai: hasGroq ? "groq" : hasOpenAI ? "openai" : "missing",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
