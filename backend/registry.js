/**
 * registry.js
 * ------------------------------------------------------
 * The Agent Registry.
 * Stores every agent ever created, tied to the human (principal) who owns it.
 * In-memory only — perfect for a hackathon prototype, no DB setup needed.
 * ------------------------------------------------------
 */

// The "database" — just an array living in memory
let agents = [];

const VALID_SCOPES = [
  'Browse', 'Purchase', 'Post', 'Delete Orders', 'Read Profile', 
  'Update Profile', 'Payment', 'Read Orders', 'Cancel Orders', 'Wishlist'
];

/**
 * Generates a short, readable unique agent ID, e.g. "agt_4f9k2a"
 */
function generateAgentId() {
  return "agt_" + Math.random().toString(36).slice(2, 8);
}

function createAgent({ agentName, principal, purpose, scope, expiryMinutes, agentType, spendingLimit, websites, security, token }) {
  // Let the frontend define scopes for this demo
  const cleanScope = scope || [];

  const agent = {
    agentId: generateAgentId(),
    name: agentName || "Unnamed Agent", // rename to name for UI
    agentName: agentName || "Unnamed Agent",
    principal: principal || "unknown",
    purpose: purpose || "",
    permissions: cleanScope, // rename for UI
    scope: cleanScope,
    agentType: agentType || "Custom",
    spendingLimit: spendingLimit || "Unlimited",
    websites: websites || [],
    security: security || {},
    token: token || null,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + (expiryMinutes || 5) * 60000).toISOString(),
    revoked: false,
    consecutiveDenials: 0,
  };

  agents.push(agent);
  return agent;
}

function updateAgentToken(agentId, token) {
  const agent = getAgent(agentId);
  if (agent) {
    agent.token = token;
  }
}

/**
 * Finds a single agent by ID.
 */
function getAgent(agentId) {
  return agents.find((a) => a.agentId === agentId);
}

/**
 * Computes the live status of an agent for display purposes.
 * Order matters: revoked beats everything, then expired, then suspicious.
 */
function computeStatus(agent) {
  if (agent.revoked) return "Revoked";
  if (new Date() > new Date(agent.expiresAt)) return "Expired";
  if (agent.consecutiveDenials >= 2) return "Suspicious";
  return "Active";
}

/**
 * Returns all agents (optionally filtered by principal) with computed status attached.
 */
function getAllAgents(principal) {
  return agents
    .filter((a) => !principal || a.principal === principal)
    .map((a) => ({ ...a, id: a.agentId, status: computeStatus(a) }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Marks an agent as revoked. Takes effect immediately on the next /verify call.
 */
function revokeAgent(agentId) {
  const agent = getAgent(agentId);
  if (!agent) return false;
  agent.revoked = true;
  return true;
}

/**
 * Called after every verification attempt to track consecutive denials,
 * which is what drives the "suspicious" flag.
 */
function recordAttemptResult(agentId, approved) {
  const agent = getAgent(agentId);
  if (!agent) return;
  agent.consecutiveDenials = approved ? 0 : agent.consecutiveDenials + 1;
}

function deleteAgent(agentId) {
  const initialLength = agents.length;
  agents = agents.filter((a) => a.agentId !== agentId);
  return agents.length < initialLength;
}

module.exports = {
  VALID_SCOPES,
  createAgent,
  updateAgentToken,
  getAgent,
  getAllAgents,
  revokeAgent,
  deleteAgent,
  recordAttemptResult,
  computeStatus,
};
