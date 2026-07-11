/**
 * logs.js
 * ------------------------------------------------------
 * Activity Monitoring.
 * Every verification attempt (approved or denied) gets recorded here.
 * This powers the live activity feed on the frontend.
 * ------------------------------------------------------
 */

let logs = [];
const MAX_LOGS = 200; // cap so memory doesn't grow unbounded during a demo

function addLog({ agentId, agentName, action, approved, reason }) {
  logs.unshift({
    agentId,
    agentName,
    action,
    result: approved ? "approved" : "denied",
    reason,
    timestamp: Date.now(),
  });

  if (logs.length > MAX_LOGS) {
    logs = logs.slice(0, MAX_LOGS);
  }
}

function getLogs(limit = 50) {
  return logs.slice(0, limit);
}

module.exports = { addLog, getLogs };
