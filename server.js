require("dotenv").config();
const express = require("express");
const path    = require("path");
const cors    = require("cors");
const helmet  = require("helmet");
const chatRoutes = require("./src/routes/chat");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));

/** CORS: merge Railway / Vercel public hostnames so the browser UI can call the API from production. */
function buildCorsOrigin() {
  const parts = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.includes("*")) return "*";
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    parts.push(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
  }
  if (process.env.VERCEL_URL) {
    parts.push(`https://${process.env.VERCEL_URL}`);
  }
  if (process.env.CORS_EXTRA_ORIGINS) {
    process.env.CORS_EXTRA_ORIGINS.split(",").forEach((s) => {
      const t = s.trim();
      if (t) parts.push(t);
    });
  }
  const unique = [...new Set(parts)];
  if (unique.length === 0) return "*";
  return (origin, callback) => {
    if (!origin) return callback(null, true);
    callback(null, unique.includes(origin));
  };
}

const corsOrigin = buildCorsOrigin();
app.use(
  cors(
    typeof corsOrigin === "function"
      ? { origin: corsOrigin, methods: ["GET", "POST"] }
      : { origin: corsOrigin, methods: ["GET", "POST"] }
  )
);
app.use(express.json({ limit: "15kb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", chatRoutes);
app.use((req, res) => res.status(404).json({ error: "Not found." }));
app.use((err, req, res, next) => res.status(500).json({ error: "Internal error." }));

const server = app.listen(PORT, () => {
  const hasGroq   = !!(process.env.GROQ_API_KEY   && !process.env.GROQ_API_KEY.includes("your_"));
  const hasOpenAI = !!(process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("your_"));
  const hasEmail  = !!(process.env.EMAIL_USER      && !process.env.EMAIL_USER.includes("your@"));
  const hasTwilio = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith("AC") && process.env.TWILIO_ACCOUNT_SID.length > 10);

  console.log(`
╔══════════════════════════════════════════════════╗
║         HealthAI SaaS v3.0 — RUNNING             ║
╠══════════════════════════════════════════════════╣
║  URL:    http://localhost:${PORT}                    ║
╠══════════════════════════════════════════════════╣
║  AI:     ${hasGroq ? "✅ Groq (free)           " : hasOpenAI ? "✅ OpenAI               " : "❌ Missing — add GROQ_API_KEY  "}║
║  Email:  ${hasEmail  ? "✅ Configured           " : "⚠️  Not set (logs only)    "}║
║  Twilio: ${hasTwilio ? "✅ Configured           " : "⚠️  Not set               "}║
╠══════════════════════════════════════════════════╣
║  Clients: brightsmile-dental                     ║
║           kensington-gp                          ║
║           london-private-hospital                ║
╚══════════════════════════════════════════════════╝
  `);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Try: PORT=3001 npm start`);
  } else {
    console.error(err);
  }
  process.exit(1);
});

module.exports = app;
