# AgentPass / AgentShield — Backend

Identity verification infrastructure for AI agents. This is Person A's
complete backend: Agent Registry, Permission Manager, JWT Token Service
(issue + verify), Revocation, Activity Monitoring, and an AI-decision
bonus endpoint.

## Project structure

```
AgentPass-backend/
├── server.js         # Express app, all routes
├── registry.js        # Agent Registry + Permission Manager + status logic
├── tokenService.js    # JWT signing / verification
├── logs.js             # Activity Monitoring (in-memory log)
├── package.json
├── .env.example
└── README.md
```

## Setup (VS Code, Windows)

1. Copy this whole `AgentPass-backend` folder into:
   `D:\JAVA\projects\project AgentPass\backend`
2. Open that folder in VS Code.
3. Open a terminal in VS Code (`` Ctrl + ` ``) and run:
   ```
   npm install
   ```
4. (Optional — only for the AI bonus feature) Copy `.env.example` to `.env`
   and add your Anthropic API key:
   ```
   copy .env.example .env
   ```
   Then edit `.env` and paste your key on the `ANTHROPIC_API_KEY=` line.
   **If you skip this, the app still works fine** — `/decide` just falls
   back to picking the agent's first permitted action instead of asking an LLM.
5. Start the server:
   ```
   npm start
   ```
   You should see: `AgentShield backend running at http://localhost:4000`

6. For auto-restart on file changes while developing:
   ```
   npm run dev
   ```

## Endpoints (share this with Person B — it's your API contract)

### `POST /issue`
Creates an agent and returns its signed token.
```json
// Request
{
  "agentName": "Shopping Bot",
  "principal": "priya@gmail.com",
  "purpose": "Buy a birthday gift under $50",
  "scope": ["browse", "purchase"],
  "expiryMinutes": 2
}
// Response
{ "agentId": "agt_c5ym2q", "token": "eyJ...", "expiresAt": 1783755282085 }
```

### `POST /verify`
Checks a token before an agent is allowed to act.
```json
// Request
{ "token": "eyJ...", "action": "browse" }
// Response
{ "approved": true, "reason": "approved" }
// or
{ "approved": false, "reason": "\"post\" is not in this agent's permitted scope" }
```
Possible denial reasons: `unknown agent`, `agent has been revoked`,
`"<action>" is not in this agent's permitted scope`, `token has expired`,
`invalid or tampered token`.

### `POST /revoke`
Instantly revokes an agent. Every future `/verify` call for it will fail.
```json
// Request
{ "agentId": "agt_c5ym2q" }
// Response
{ "success": true }
```

### `GET /agents?principal=priya@gmail.com`
Lists all agents for a user, with live computed status:
`active | expired | revoked | suspicious`.

### `GET /logs?limit=50`
Returns the activity feed, most recent first — poll this from the
frontend every 2–3 seconds for the live monitoring table.

### `POST /decide` (AI bonus feature)
Given an agent's goal and permitted scope, asks an LLM which action to
attempt next.
```json
// Request
{ "agentId": "agt_c5ym2q" }
// Response
{ "action": "browse", "reasoning": "Browsing first to find gift options within budget." }
```
Works without an API key too (returns a safe fallback action) — so the
demo never breaks if the LLM call is slow or unavailable.

## How the verification chain works (order matters)

1. **Signature check** — is the token authentic and untampered?
2. **Expiry check** — has the token's time limit passed?
3. **Revocation check** — has the owner revoked this agent?
4. **Scope check** — is the requested action actually permitted?

Any failure returns `approved: false` with a specific, human-readable reason
— the frontend displays this reason directly, so keep messages clear if you
extend this.

## Suspicious activity flagging

Each agent tracks `consecutiveDenials`. Two or more denials in a row (without
an approval resetting the counter) flips its status to `suspicious` in the
`/agents` response — no extra endpoint needed, it's computed live.

## Testing without the frontend

You can test every endpoint with `curl` or Postman before Person B's UI is
ready. Example flow:

```bash
# 1. Issue a token
curl -X POST http://localhost:4000/issue -H "Content-Type: application/json" \
  -d "{\"agentName\":\"Test Bot\",\"principal\":\"you@gmail.com\",\"scope\":[\"browse\"],\"expiryMinutes\":2}"

# 2. Verify an allowed action (use the token from step 1)
curl -X POST http://localhost:4000/verify -H "Content-Type: application/json" \
  -d "{\"token\":\"PASTE_TOKEN_HERE\",\"action\":\"browse\"}"

# 3. Verify a denied action
curl -X POST http://localhost:4000/verify -H "Content-Type: application/json" \
  -d "{\"token\":\"PASTE_TOKEN_HERE\",\"action\":\"purchase\"}"
```

## Notes for the demo

- Use very short `expiryMinutes` (e.g. `0.5` = 30 seconds) when you want
  judges to see a token expire live.
- CORS is already enabled for all origins, so Person B's frontend (any
  port, e.g. `localhost:3000` or `5173`) can call this API with no extra config.
- Everything is in-memory — restarting the server wipes all agents/logs.
  That's fine for a hackathon; just don't restart mid-demo.
