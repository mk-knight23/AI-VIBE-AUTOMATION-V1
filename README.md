<div align="center">

# ⚙️ AI-VIBE-AUTOMATION-V1

### **Visual AI Workflow Automation Platform**
*Next.js 15 · React Flow · Inngest · Multi-LLM · Drag & Drop*

[![Next.js](https://img.shields.io/badge/Next.js-15.0+-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![React Flow](https://img.shields.io/badge/React_Flow-11.0+-FF0072?style=for-the-badge)](https://reactflow.dev)
[![Inngest](https://img.shields.io/badge/Inngest-Jobs-5D5DFF?style=for-the-badge)](https://inngest.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**[🚀 Live Demo](https://ai-vibe-automation-v1.vercel.app)** · **[📖 Docs](#documentation)** · **[⭐ Star](https://github.com/mk-knight23/AI-VIBE-AUTOMATION-V1)**

</div>

---

## 🎯 Automate Anything With Visual Flows

AI-VIBE-AUTOMATION-V1 is a **no-code/low-code AI workflow builder** — drag nodes onto a canvas, connect them, and create powerful automation workflows that run in the background via Inngest. Think n8n meets AI-native design.

> **Pillar 4, Iteration 1** — The automation engine with drag-and-drop simplicity.

---

## ✨ Node Library

### Trigger Nodes
| Node | Description |
|------|-------------|
| ⏰ **Schedule** | Cron-based triggers (every hour, daily, etc.) |
| 🔔 **Webhook** | HTTP webhook trigger |
| 📧 **Email** | On new email (Gmail/Outlook) |
| 💬 **Slack Message** | On Slack event |
| 📁 **File Change** | On file system change |

### Action Nodes
| Node | Description |
|------|-------------|
| 🤖 **AI Node** | Call any LLM (Claude, GPT-4o, Gemini) |
| 🌐 **API Node** | HTTP GET/POST to any endpoint |
| 📤 **Email Send** | Send email via Resend/Sendgrid |
| 💬 **Slack Send** | Post to Slack channels |
| 🗄️ **Database** | Query/insert PostgreSQL |
| 📊 **Google Sheets** | Read/write spreadsheet rows |
| 🐙 **GitHub** | Create issues, PRs, releases |

### Logic Nodes
| Node | Description |
|------|-------------|
| 🔀 **If/Else** | Conditional branching |
| 🔁 **Loop** | Iterate over arrays |
| ⏳ **Delay** | Wait N seconds/minutes |
| 🔄 **Merge** | Combine parallel branches |
| ⚠️ **Error Handler** | Catch and handle failures |

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── layout.tsx                # Providers (Auth, tRPC, Theme)
│   ├── dashboard/page.tsx        # Workflow dashboard
│   ├── builder/[id]/page.tsx     # Flow builder
│   └── api/
│       ├── inngest/route.ts      # Inngest webhook handler
│       └── workflows/route.ts    # Workflow CRUD API
├── components/
│   ├── agent-builder/
│   │   ├── AgentCanvas.tsx       # React Flow canvas
│   │   ├── NodeSidebar.tsx       # Draggable node palette
│   │   ├── SettingsPanel.tsx     # Node configuration panel
│   │   └── nodes/
│   │       ├── AINode.tsx        # LLM call node
│   │       ├── APINode.tsx       # HTTP request node
│   │       ├── StartNode.tsx     # Workflow trigger
│   │       ├── EndNode.tsx       # Workflow terminal
│   │       ├── IfElseNode.tsx    # Conditional branch
│   │       └── OtherNodes.tsx    # Email, Slack, DB, etc.
├── inngest/
│   ├── client.ts                 # Inngest client setup
│   ├── functions/
│   │   ├── executeWorkflow.ts    # Main workflow executor
│   │   ├── executeNode.ts        # Individual node runner
│   │   └── handleError.ts        # Error recovery
└── prisma/
    └── schema.prisma             # Workflow, Node, Execution, Log
```

---

## 🔄 Workflow Execution

Workflows run as **Inngest background jobs** — reliable, retryable, with full execution history:

```typescript
// inngest/functions/executeWorkflow.ts
export const executeWorkflow = inngest.createFunction(
  { id: 'execute-workflow', retries: 3 },
  { event: 'workflow.trigger' },
  async ({ event, step }) => {
    const { workflowId, triggerData } = event.data

    const workflow = await step.run('load-workflow', async () =>
      db.workflow.findUnique({ where: { id: workflowId }, include: { nodes: true } })
    )

    const executionContext: ExecutionContext = { data: triggerData, variables: {} }

    for (const node of topologicalSort(workflow.nodes)) {
      const result = await step.run(`execute-node-${node.id}`, async () =>
        executeNode(node, executionContext)
      )
      executionContext.variables[node.id] = result
    }

    return { success: true, executionId: workflow.id }
  }
)
```

---

## 🚀 Quick Start

```bash
git clone https://github.com/mk-knight23/AI-VIBE-AUTOMATION-V1.git
cd AI-VIBE-AUTOMATION-V1
npm install
cp .env.example .env.local
npx prisma migrate dev
npm run dev  # → http://localhost:3000
```

### Environment Variables

```env
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=...
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...
RESEND_API_KEY=re_...
SLACK_BOT_TOKEN=xoxb-...
```

---

## 🎯 Example Workflows

### 1. AI Email Digest
```
[Cron: 9AM daily] → [Gmail: Fetch unread] → [AI: Summarize] → [Email: Send digest]
```

### 2. GitHub Auto-Reviewer
```
[Webhook: PR opened] → [GitHub: Get diff] → [AI: Review code] → [GitHub: Post comment]
```

### 3. Slack Alert Bot
```
[Cron: Every 5min] → [API: Check metrics] → [If: Error rate > 5%] → [Slack: Alert #ops]
```

---

<div align="center">

**Built with ⚙️ by [Kazi Musharraf](https://mkazi.live)**

*Part of the [AI-VIBE Ecosystem](https://github.com/mk-knight23/AI-VIBE-ECOSYSTEM) · Built in India 🇮🇳*

</div>
