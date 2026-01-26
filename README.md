# Agentify - AI Agent Builder Platform

Build powerful AI agents with drag-and-drop simplicity. Create , deploy, and manage custom AI workflows.

![Agentify](https://img.shields.io/badge/version-1.0.0-purple)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

- **Visual Flow Builder** - Drag-and-drop interface powered by React Flow
- **Multi-Provider AI** - Support for OpenAI, Anthropic, and Google (Gemini)
- **Background Jobs** - Inngest for reliable workflow execution and retries
- **Enterprise Security** - Arcjet rate limiting and bot protection  
- **Modern Auth** - BetterAuth for secure, modern authentication
- **Streaming Responses** - Real-time AI output with Vercel AI SDK
- **Monetization** - Polar SDK for subscriptions and payments

## 📦 Tech Stack

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

# Polar (Payments)
POLAR_ACCESS_TOKEN=...
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=...

# Arcjet (Security)  
ARCJET_KEY=ajkey_...

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

## 📁 Project Structure

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

## 🎨 Node Types

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

## 🚢 Deployment

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

## 📖 API Reference

### Execute Agent

```http
POST /api/execute
Content-Type: application/json

{
  "agentId": "agent_id_here",
  "message": "User input message"
}
```

Configure webhooks for Polar and other services in `src/app/api/webhooks`.

## 🔒 Security

- Rate limiting via Arcjet (configurable per tier)
- Bot detection and blocking
- Input validation and sanitization
- Secure API routes with middleware

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

---

Built with ❤️ using Next.js, Prisma, and React Flow
