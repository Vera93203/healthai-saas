const path = require("path");
const cache = new Map();

function loadClient(clientId) {
  if (cache.has(clientId)) return cache.get(clientId);
  try {
    const c = require(path.resolve(__dirname, "../../clients", `${clientId}.js`));
    // Support both old (clinicId) and new (clientId) format
    if (!c.clientId && c.clinicId) c.clientId = c.clinicId;
    cache.set(clientId, c);
    console.log(`[CLIENT] Loaded: ${c.businessName || c.clinicName} (${c.businessType || "healthcare"})`);
    return c;
  } catch (e) {
    // Try old clients folder name
    try {
      const c = require(path.resolve(__dirname, "../../clinics", `${clientId}.config.js`));
      c.clientId = c.clinicId;
      c.businessName = c.clinicName;
      c.businessType = "dental_clinic";
      cache.set(clientId, c);
      return c;
    } catch { return null; }
  }
}

function listClients() { return Array.from(cache.keys()); }
module.exports = { loadClient, listClients };
