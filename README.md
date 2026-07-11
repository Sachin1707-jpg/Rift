# 🛡️ AI Passport 

> **Secure, auditable identity management for AI agents.**  
> Built for the Lenovo x Hackathon 2026.

---

## 🚀 The Problem

AI agents are increasingly being deployed to browse the web, make purchases, post content, and interact with services on behalf of humans. But today, **there is no standard way to control, limit, or audit what an AI agent is actually allowed to do.**

An AI agent with unchecked access can:
- Overspend beyond the user's budget
- Post content without permission
- Access sensitive user data it doesn't need
- Act without a traceable identity

---

## 💡 Our Solution — AI Passport

**AI Passport** introduces the concept of an **Agent Passing** — a cryptographically signed JWT token that acts as a digital identity card for every AI agent.

Each passport defines:
- ✅ What the agent **can** do (permissions)
- ⏱️ How long it is **valid** (expiry)
- 💰 How much it can **spend** (spending limits)
- 🌐 Which **websites** it can access
- 🔐 What **security rules** apply

Every action the agent attempts is verified against its passport in real time. If the action is not permitted — **it is denied instantly.**

---

## 🎯 Key Features

| Feature | Description |
|---|---|
| 🪪 AI Passport Wizard | Premium multi-step form to create agent identities |
| 🔐 JWT Token Signing | Real cryptographic tokens issued by backend |
| ✅ Permission Engine | Per-action verification (Browse, Purchase, Post, etc.) |
| 📋 Activity Log | Real-time audit trail of every agent action |
| ⏱️ Expiry Countdown | Live countdown timers on every agent card |
| 🚫 Revoke & Delete | Instantly cut off agent access |
| 🤖 AI Simulation | Watch an AI agent navigate permissions in real time |
| 📊 Analytics Dashboard | Visual charts of agent activity and trust scores |

---

## 🏗️ Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS v4
- Framer Motion (animations)
- Lucide React (icons)
- React Router v6

**Backend**
- Node.js + Express
- JSON Web Tokens (JWT)
- In-memory agent registry (no DB needed)
- CORS enabled for cross-origin requests

---

## 📁 Project Structure

```

|── backend/                  # Node.js Express API
│   ├── server.js             # Main server + all API routes
│   ├── registry.js           # In-memory agent database
│   ├── tokenService.js       # JWT sign/verify logic
│   ├── logs.js               # Activity log storage
│   └── package.json
├── src/                      # React frontend
│   ├── components/           # UI components
│   ├── context/              # AgentContext, AuthContext
│   ├── pages/                # Dashboard, Logs, Store, Login
│   ├── services/api.js       # Backend API client
│   └── hooks/                # Custom React hooks
├── index.html
├── vite.config.js
└── package.json
```

---

## ⚙️ Running Locally

### Prerequisites
- Node.js v18+
- npm

### Step 1 — Start the Backend
```bash
cd backend
npm install
npm start
# Running at http://localhost:4000
```

### Step 2 — Start the Frontend
```bash
# In the root directory
npm install
npm run dev
# Running at http://localhost:5173
```

### Step 3 — Open the App
```
http://localhost:5173
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/issue` | Create a new agent + issue JWT passport |
| `POST` | `/verify` | Verify an action against the agent's passport |
| `POST` | `/revoke` | Immediately revoke an agent's access |
| `GET` | `/agents` | List all registered agents |
| `DELETE` | `/agents/:id` | Delete an agent permanently |
| `GET` | `/logs` | Retrieve the activity audit log |

---

## 🌐 Demo Flow

1. **Login** → Enter the dashboard
2. **Create Agent** → Fill out the AI Passport wizard (name, permissions, spending limit, websites)
3. **Issue Passport** → JWT token is signed by the backend
4. **Launch Agent** → Agent attempts actions; each is verified against its passport
5. **View Logs** → See every approved/denied action in the Activity Log
6. **Revoke** → Instantly block the agent if needed

---

## 👥 Team Vengeance

Built with ❤️ for the RIFT Hackathon 2026.

---

## 📄 License

MIT License — free to use and modify.
