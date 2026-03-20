require("dotenv").config();
const express = require("express");
const path    = require("path");
const cors    = require("cors");
const helmet  = require("helmet");
const chatRoutes = require("./src/routes/chat");

const app  = express();
const PORT = process.env.PORT || 3000;

// Required for Railway/Heroku/any proxy — fixes rate limiter error
app.set("trust proxy", 1);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: "*", methods: ["GET","POST"] }));
app.use(express.json({ limit: "15kb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", chatRoutes);
app.use((req, res) => res.status(404).json({ error: "Not found." }));
app.use((err, req, res, next) => res.status(500).json({ error: "Internal error." }));

app.listen(PORT, () => {
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

module.exports = app;