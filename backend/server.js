/**
 * server.js
 * ------------------------------------------------------
 * AgentShield / AgentPass — Backend
 * Identity verification infrastructure for AI agents.
 *
 * Endpoints:
 *   POST /issue    - create an agent + issue its signed token
 *   POST /verify   - verify a token before an agent acts
 *   POST /revoke   - revoke an agent's access immediately
 *   GET  /agents   - list all agents (with live status)
 *   GET  /logs     - activity monitoring feed
 *   POST /decide   - (AI bonus) ask an LLM to pick the agent's next action
 * ------------------------------------------------------
 */

const express = require("express");
const cors = require("cors");

const registry = require("./registry");
const tokenService = require("./tokenService");
const logs = require("./logs");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors()); // required so the frontend (different port) can call this API
app.use(express.json());

// Simple request logger, handy while developing
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ------------------------------------------------------
// POST /issue
// Creates an agent in the Registry and returns a signed JWT "passport".
// ------------------------------------------------------
app.post("/issue", (req, res) => {
  const { name, principal, purpose, permissions, expiryMinutes, agentType, spendingLimit, websites, security } = req.body;

  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  // Use default principal if none provided (demo mode)
  const agentPrincipal = principal || "user@example.com";

  const agent = registry.createAgent({
    agentName: name,
    principal: agentPrincipal,
    purpose,
    scope: permissions,
    expiryMinutes: Number(expiryMinutes) || 5,
    agentType,
    spendingLimit,
    websites,
    security
  });

  const token = tokenService.issueToken({
    agentId: agent.agentId,
    principal: agent.principal,
    scope: agent.scope,
    expiresAt: agent.expiresAt,
  });

  // Store token on agent so UI can display it
  registry.updateAgentToken(agent.agentId, token);

  const returnedAgent = {
    ...agent,
    id: agent.agentId,
    status: registry.computeStatus(agent)
  };

  res.json({
    data: returnedAgent, // Return the whole agent object under data with required UI fields
    agentId: agent.agentId,
    token,
    expiresAt: agent.expiresAt,
  });
});

// ------------------------------------------------------
// POST /verify
// The core check: is this token valid, unexpired, unrevoked,
// and does it grant permission for the requested action?
// ------------------------------------------------------
app.post("/verify", (req, res) => {
  const { token, action } = req.body;

  if (!token || !action) {
    return res.status(400).json({ approved: false, reason: "token and action are required" });
  }

  let result;
  let agentIdForLog = null;
  let agentNameForLog = "Unknown agent";

  try {
    // 1. Signature + expiry check (jwt.verify throws if either fails)
    const decoded = tokenService.decodeToken(token);
    agentIdForLog = decoded.agentId;

    const agent = registry.getAgent(decoded.agentId);
    if (agent) agentNameForLog = agent.agentName;

    if (!agent) {
      result = { approved: false, reason: "unknown agent" };
    } else if (agent.revoked) {
      // 2. Revocation check
      result = { approved: false, reason: "agent has been revoked" };
    } else if (!agent.scope.includes(action)) {
      // 3. Scope check
      result = { approved: false, reason: `"${action}" is not in this agent's permitted scope` };
    } else {
      result = { approved: true, reason: "approved" };
    }
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      result = { approved: false, reason: "token has expired" };
    } else {
      result = { approved: false, reason: "invalid or tampered token" };
    }
  }

  // Update consecutive-denial tracking (drives the "suspicious" flag)
  if (agentIdForLog) {
    registry.recordAttemptResult(agentIdForLog, result.approved);
  }

  // Log every attempt, approved or denied
  logs.addLog({
    agentId: agentIdForLog,
    agentName: agentNameForLog,
    action,
    approved: result.approved,
    reason: result.reason,
  });

  res.json(result);
});

// ------------------------------------------------------
// POST /revoke
// Instantly revokes an agent. Next /verify call for it will fail.
// ------------------------------------------------------
app.post("/revoke", (req, res) => {
  const { agentId } = req.body;
  if (!agentId) return res.status(400).json({ success: false, error: "agentId is required" });

  const success = registry.revokeAgent(agentId);
  res.json({ success });
});

// ------------------------------------------------------
// GET /agents?principal=someone@gmail.com
// Lists all agents (optionally filtered by owner) with live status.
// ------------------------------------------------------
app.get("/agents", (req, res) => {
  const { principal } = req.query;
  res.json(registry.getAllAgents(principal));
});

// ------------------------------------------------------
// DELETE /agents/:id
// Deletes an agent from the registry entirely.
// ------------------------------------------------------
app.delete("/agents/:id", (req, res) => {
  const { id } = req.params;
  const success = registry.deleteAgent(id);
  res.json({ success });
});

// ------------------------------------------------------
// GET /logs?limit=50
// Returns the activity monitoring feed, most recent first.
// ------------------------------------------------------
app.get("/logs", (req, res) => {
  const limit = Number(req.query.limit) || 50;
  res.json(logs.getLogs(limit));
});

// ------------------------------------------------------
// POST /decide  (AI Integration bonus feature)
// Given an agent's goal + allowed scope, ask an LLM which action
// it should attempt next. Falls back gracefully if no API key is set.
// ------------------------------------------------------
app.post("/decide", async (req, res) => {
  const { agentId } = req.body;
  const agent = registry.getAgent(agentId);

  if (!agent) return res.status(404).json({ error: "agent not found" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Graceful fallback so the demo never breaks if the key isn't set
    const fallbackAction = agent.scope[0] || "browse";
    return res.json({
      action: fallbackAction,
      reasoning: "(fallback: no ANTHROPIC_API_KEY set) Choosing the first permitted action.",
    });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content:
              `You are an AI agent named "${agent.agentName}" with the goal: "${agent.purpose}".\n` +
              `Your permitted actions are: ${agent.scope.join(", ") || "none"}.\n` +
              `Pick exactly ONE action from your permitted list (or, if none fit, pick the closest one even if you suspect it might be denied) ` +
              `that best moves you toward your goal right now.\n` +
              `Respond ONLY as JSON: {"action": "...", "reasoning": "one short sentence"}`,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content?.map((c) => c.text || "").join("") || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    res.json({ action: parsed.action, reasoning: parsed.reasoning });
  } catch (err) {
    console.error("LLM decide error:", err.message);
    const fallbackAction = agent.scope[0] || "browse";
    res.json({
      action: fallbackAction,
      reasoning: "(fallback: LLM call failed) Choosing the first permitted action.",
    });
  }
});

// ------------------------------------------------------
// Health check
// ------------------------------------------------------
app.get("/", (req, res) => {
  res.json({ status: "AgentShield backend is running" });
});

app.listen(PORT, () => {
  console.log(`AgentShield backend running at http://localhost:${PORT}`);
});
