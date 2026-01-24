# Agentify - AI Agent Builder Platform

Build powerful AI agents with drag-and-drop simplicity. Create , deploy, and manage custom AI workflows.

![Agentify](https://img.shields.io/badge/version-1.0.0-purple)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

- **Visual Flow Builder** - Drag-and-drop interface powered by React Flow
- **Multi-Provider AI** - Support for OpenAI, Anthropic, and Google
- **Real-time Database** - Convex for instant sync and reactivity
- **Enterprise Security** - Arcjet rate limiting and bot protection  
- **Modern Auth** - Clerk authentication with social login
- **Streaming Responses** - Real-time AI output with Vercel AI SDK

## 📦 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | Convex |
| Auth | Clerk |
| UI | shadcn/ui, Tailwind CSS |
| Flow Editor | React Flow (XYFlow) |
| AI | Vercel AI SDK |
| Security | Arcjet |

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Convex account (optional - can run locally)
- Clerk account (for authentication)
- AI provider API keys (OpenAI, Anthropic, or Google)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/agentify.git
cd agentify

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start Convex (local development)
npx convex dev

# Start the development server (in another terminal)
npm run dev
```

### Environment Variables

Create a `.env.local` file with:

```env
# Convex
CONVEX_DEPLOYMENT=local
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210

# Clerk (https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Arcjet (https://arcjet.com)  
ARCJET_KEY=ajkey_...

# AI Providers (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

## 📁 Project Structure

```
agentify/
├── convex/                 # Backend (Convex functions)
│   ├── schema.ts          # Database schema
│   ├── agents.ts          # Agent CRUD
│   ├── executions.ts      # Execution tracking
│   └── users.ts           # User management
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # Auth pages
│   │   ├── (dashboard)/   # Dashboard layout
│   │   └── api/           # API routes
│   ├── components/
│   │   ├── agent-builder/ # React Flow components
│   │   └── ui/            # shadcn components
│   ├── lib/               # Utilities
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

### Webhooks

Configure Clerk webhook at `/api/webhook/clerk` for user sync.

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

Built with ❤️ using Next.js, Convex, and React Flow
