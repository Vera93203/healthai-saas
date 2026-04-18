const { v4: uuidv4 } = require("uuid");
const sessions = new Map();

function getSession(sessionId, clientId) {
  if (sessionId && sessions.has(sessionId)) {
    const s = sessions.get(sessionId);
    s.lastActiveAt = Date.now();
    return s;
  }
  const id =
    sessionId && typeof sessionId === "string" && sessionId.length <= 80 ? sessionId : uuidv4();
  const s = {
    id, clientId,
    createdAt: Date.now(), lastActiveAt: Date.now(),
    turnCount: 0, history: [],
    patient: { name:null, firstName:null, phone:null, email:null, isNewPatient:null, preferredService:null, preferredTime:null, concern:null },
    unknownCount: 0, escalated: false, channel: "web", summary: [],
  };
  sessions.set(s.id, s);
  return s;
}

function updatePatient(sessionId, data) {
  const s = sessions.get(sessionId);
  if (!s) return;
  Object.assign(s.patient, data);
  if (data.name && !s.patient.firstName) s.patient.firstName = data.name.split(" ")[0];
}

function addToHistory(sessionId, role, content) {
  const s = sessions.get(sessionId);
  if (!s) return;
  s.history.push({ role, content });
  s.turnCount++;
  s.lastActiveAt = Date.now();
  const max = 14;
  if (s.history.length > max * 2) s.history = s.history.slice(s.history.length - max * 2);
}

function getHistory(sessionId) { return sessions.get(sessionId)?.history || []; }
function getPatient(sessionId)  { return sessions.get(sessionId)?.patient || {}; }
function addSummary(sessionId, note) { const s=sessions.get(sessionId); if(s) s.summary.push(note); }

setInterval(() => {
  const cutoff = Date.now() - 60*60*1000;
  for (const [id, s] of sessions.entries()) { if (s.lastActiveAt < cutoff) sessions.delete(id); }
}, 15*60*1000);

module.exports = { getSession, updatePatient, addToHistory, getHistory, getPatient, addSummary };
