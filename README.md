# 🤖 AI-VIBE-AUTOMATION-V1 | Agentify

<p align="center">
  <img src="https://img.shields.io/badge/AI--VIBE-AUTOMATION--V1-black?style=for-the-badge&logo=next.js&logoColor=white" alt="AI Vibe Project">
  <br>
  <b>Build powerful AI agents with drag-and-drop simplicity. Create, deploy, and manage custom AI workflows.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-purple" alt="Version">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License: MIT">
</p>

---

## 🗺️ Quick Navigation

- [✨ Features](#-features)
- [🛠️ Tech Stack](#%EF%B8%8F-tech-stack)
- [🛠️ Getting Started](#%EF%B8%8F-getting-started)
- [📁 Project Structure](#-project-structure)
- [🎨 Node Types](#-node-types)
- [🚢 Deployment](#-deployment)
- [📖 API Reference](#-api-reference)
- [🔒 Security](#-security)

---

## 🛠️ Engineered With

<p align="left">
  <a href="https://nextjs.org"><img src="https://skillicons.dev/icons?i=nextjs" alt="Next.js"></a>
  <a href="https://react.dev"><img src="https://skillicons.dev/icons?i=react" alt="React"></a>
  <a href="https://prisma.io"><img src="https://skillicons.dev/icons?i=prisma" alt="Prisma"></a>
  <a href="https://inngest.com"><img src="https://img.shields.io/badge/Jobs-Inngest-FF3E00" alt="Inngest"></a>
  <a href="https://tailwindcss.com"><img src="https://skillicons.dev/icons?i=tailwind" alt="Tailwind CSS"></a>
  <a href="https://arcjet.com"><img src="https://img.shields.io/badge/Security-Arcjet-5C2D91" alt="Arcjet"></a>
</p>

---

## ✨ Features

- **Visual Flow Builder** - Drag-and-drop interface powered by React Flow
- **Multi-Provider AI** - Support for OpenAI, Anthropic, and Google (Gemini)
- **Background Jobs** - Inngest for reliable workflow execution and retries
- **Enterprise Security** - Arcjet rate limiting and bot protection  
- **Modern Auth** - BetterAuth for secure, modern authentication
- **Streaming Responses** - Real-time AI output with Vercel AI SDK
- **Monetization** - Polar SDK for subscriptions and payments

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Neon) with Prisma ORM |
| Auth | BetterAuth |
| Background Jobs | Inngest |
| Payments | Polar SDK |
| UI | shadcn/ui, Tailwind CSS |
| Flow Editor | React Flow (XYFlow) |
| AI | Vercel AI SDK |
| Security | Arcjet |

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Neon Database (PostgreSQL)
- Inngest (for background jobs)
- Polar (for payments)
- AI provider API keys (OpenAI, Anthropic, or Google)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/agentify.git
cd agentify

# Install dependencies
npm install

# Setup Prisma
npx prisma generate
npx prisma db push

# Start the development server
npm run dev
```

### Environment Variables

```env
# Database (Neon/Postgres)
DATABASE_URL=postgresql://...

# Auth (BetterAuth)
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000

# Inngest
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

---

## 📁 Project Structure

<details>
<summary>View Detailed Directory Map</summary>

```
agentify/
├── prisma/                # Database schema and migrations
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # BetterAuth pages
│   │   ├── (dashboard)/   # Dashboard layout
│   │   └── api/           # API routes (Inngest, Auth, Webhooks)
│   ├── actions/           # Server actions (Workflows, Payments)
│   ├── components/
│   │   ├── agent-builder/ # React Flow components
│   │   └── ui/            # shadcn components
│   ├── lib/               # Utilities (Prisma, Inngest, AI, Auth)
│   └── types/             # TypeScript types
└── public/                # Static assets
```
</details>

---

## 🎨 Node Types

<details>
<summary>View Available Workflow Nodes</summary>

| Node | Description |
|------|-------------|
| **Start** | Entry point with manual/webhook/scheduled triggers |
| **AI** | LLM processing (OpenAI, Anthropic, Google) |
| **API** | HTTP requests (GET, POST, PUT, DELETE) |
| **If/Else** | Conditional branching |
| **Loop** | Iteration over collections or counts |
| **Code** | JavaScript execution |
| **Delay** | Pause execution |
| **Variable** | Set/get variables |
| **End** | Terminate workflow |

</details>

---

## 🚢 Deployment

<details>
<summary>Deployment Guide (Vercel & Docker)</summary>

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```
</details>

---

## 📖 API Reference

<details>
<summary>REST API Documentation</summary>

### Execute Agent

```http
POST /api/execute
Content-Type: application/json

{
  "agentId": "agent_id_here",
  "message": "User input message"
}
```
</details>

---

## 🔒 Security

- Rate limiting via Arcjet (configurable per tier)
- Bot detection and blocking
- Input validation and sanitization
- Secure API routes with middleware

---

## 🚀 Call to Action

- **Star this repo** if you find it useful!
- **Follow for updates** on the AI-VIBE Ecosystem.
- **Contribute** by opening issues or PRs.

---

## 🤝 Contributing & License

Contributions welcome! Please read our contributing guidelines first.

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  <i>Built with ❤️ using Next.js, Prisma, and React Flow</i>
</p>

