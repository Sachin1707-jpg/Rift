/**
 * tokenService.js
 * ------------------------------------------------------
 * The JWT Token Service.
 * Handles signing (issue) and validating (verify) agent credentials.
 * This is the cryptographic core of AgentPass — the "passport" itself.
 * ------------------------------------------------------
 */

const jwt = require("jsonwebtoken");

// Hardcoded secret is fine for a hackathon prototype.
// In a real system this would be a securely stored, rotated key.
const SECRET = "agentshield-super-secret-key-2026";

/**
 * Signs a new token for an agent.
 * The token itself carries agentId, principal, and scope — so any
 * external service can verify a request without calling back to us
 * for anything except revocation status.
 */
function issueToken({ agentId, principal, scope, expiresAt }) {
  const expiryMs = new Date(expiresAt).getTime();
  return jwt.sign(
    {
      agentId,
      principal,
      scope,
    },
    SECRET,
    {
      expiresIn: Math.max(1, Math.floor((expiryMs - Date.now()) / 1000)) + "s",
    }
  );
}

/**
 * Verifies a token's signature and expiry.
 * Throws if invalid/expired/tampered — caller should wrap in try/catch.
 * Returns the decoded payload if valid.
 */
function decodeToken(token) {
  return jwt.verify(token, SECRET); // throws TokenExpiredError / JsonWebTokenError
}

module.exports = { issueToken, decodeToken };
