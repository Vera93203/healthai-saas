/**
 * Universal Core Agent
 * ─────────────────────
 * Works for any healthcare client.
 * Uses Groq (free) or OpenAI (production).
 */

const { TOOL_DEFINITIONS, executeTool } = require("../tools/agentTools");
const { getSession, addToHistory, getHistory, updatePatient, addSummary } = require("../memory/sessionMemory");
const { safetyCheck } = require("../middleware/safetyFilter");
const { buildSystemPrompt } = require("./promptBuilder");

// Use Groq if available, fall back to OpenAI
function getAIClient() {
  if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes("your_")) {
    const Groq = require("groq-sdk");
    return { client: new Groq({ apiKey: process.env.GROQ_API_KEY }), provider: "groq" };
  }
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("your_")) {
    const OpenAI = require("openai");
    return { client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }), provider: "openai" };
  }
  throw new Error("No AI API key found. Add GROQ_API_KEY or OPENAI_API_KEY to .env");
}

let aiClientCache = null;
let loggedProvider = false;

function getAIClientLazy() {
  if (aiClientCache) return aiClientCache;
  aiClientCache = getAIClient();
  if (!loggedProvider) {
    console.log(`[AI] Using ${aiClientCache.provider.toUpperCase()}`);
    loggedProvider = true;
  }
  return aiClientCache;
}

/** Groq does not host OpenAI model IDs; swap to a Groq-compatible model when needed. */
function resolveModel(client, provider) {
  const configured = client.ai?.model || "gpt-4o-mini";
  if (provider !== "groq") return configured;
  const groqExplicit = client.ai?.groqModel || process.env.GROQ_MODEL;
  if (groqExplicit) return groqExplicit;
  if (/^(gpt-|o\d|chatgpt)/i.test(configured)) return "llama-3.3-70b-versatile";
  return configured;
}

async function runAgent(sessionId, message, client, channel = "web") {
  const session = getSession(sessionId, client.clientId || client.clinicId);
  session.channel = channel;
  const startTime = Date.now();

  // ── Safety Check (no API keys required) ─────────────────────────────────
  const safety = safetyCheck(message, client, session);
  if (safety.blocked) {
    addToHistory(session.id, "user", message);
    addToHistory(session.id, "assistant", safety.response);
    return {
      text: safety.response,
      intent: safety.intent,
      toolsUsed: [],
      sessionId: session.id,
      latencyMs: Date.now() - startTime,
    };
  }

  let ai;
  let provider;
  try {
    ({ client: ai, provider } = getAIClientLazy());
  } catch {
    const msg =
      "The assistant is not configured yet. Please add a valid GROQ_API_KEY or OPENAI_API_KEY on the server.";
    addToHistory(session.id, "user", message);
    addToHistory(session.id, "assistant", msg);
    return {
      text: msg,
      toolsUsed: [],
      sessionId: session.id,
      latencyMs: Date.now() - startTime,
      patient: session.patient,
    };
  }

  const model = resolveModel(client, provider);

  addToHistory(session.id, "user", message);

  const systemPrompt = buildSystemPrompt(client, session);
  const messages = [
    { role: "system", content: systemPrompt },
    ...getHistory(session.id),
  ];

  let toolsUsed = [];
  let finalText = "";

  try {
    // ── First AI call — decide which tools to use ─────────────────────────
    const response = await ai.chat.completions.create({
      model,
      max_tokens: client.ai?.maxTokens || 600,
      temperature: client.ai?.temperature || 0.4,
      messages,
      tools: TOOL_DEFINITIONS,
      tool_choice: "auto",
    });

    const choice = response.choices[0];

    // ── Execute tools ─────────────────────────────────────────────────────
    if (choice.finish_reason === "tool_calls" && choice.message.tool_calls?.length) {
      messages.push(choice.message);
      const toolResults = [];

      for (const toolCall of choice.message.tool_calls) {
        const toolName = toolCall.function.name;
        let args = {};
        try { args = JSON.parse(toolCall.function.arguments || "{}"); } catch {}

        console.log(`[TOOL] ${toolName}`, JSON.stringify(args).slice(0, 100));
        toolsUsed.push(toolName);

        const result = await executeTool(toolName, args, { client, session });

        if (toolName === "collect_patient_info") updatePatient(session.id, args);

        toolResults.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });

        addSummary(session.id, `Tool: ${toolName} | ${JSON.stringify(args).slice(0, 60)}`);
      }

      messages.push(...toolResults);

      // ── Second AI call — generate final response ──────────────────────
      const finalResponse = await ai.chat.completions.create({
        model,
        max_tokens: client.ai?.maxTokens || 600,
        temperature: client.ai?.temperature || 0.4,
        messages,
      });
      finalText = finalResponse.choices[0].message.content || "";
    } else {
      finalText = choice.message.content || "";
    }

    addToHistory(session.id, "assistant", finalText);
    session.unknownCount = 0;

    return {
      text: finalText,
      toolsUsed,
      sessionId: session.id,
      patient: session.patient,
      latencyMs: Date.now() - startTime,
    };

  } catch (err) {
    console.error("[AGENT ERROR]", err.message);
    const fallback = `I'm having a technical issue. Please call us on ${client.contact?.phone || "reception"} and our team will help you straight away.`;
    addToHistory(session.id, "assistant", fallback);
    return { text: fallback, toolsUsed, sessionId: session.id, error: err.message, latencyMs: Date.now() - startTime };
  }
}

module.exports = { runAgent };
