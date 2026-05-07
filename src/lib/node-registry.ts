// node-registry.ts — All available automation node types
// AI-VIBE-AUTOMATION-V1 v2.0 | Kazi Musharraf | mkazi.live

export interface NodeDefinition {
  type: string
  category: 'trigger' | 'action' | 'logic' | 'ai' | 'data'
  label: string
  description: string
  icon: string
  color: string
  inputs: Port[]
  outputs: Port[]
  configSchema: Record<string, FieldDef>
}

export interface Port { id: string; label: string; type: 'any' | 'string' | 'number' | 'boolean' | 'object' | 'array' }
export interface FieldDef { label: string; type: 'text' | 'textarea' | 'select' | 'number' | 'toggle'; required?: boolean; options?: string[]; placeholder?: string }

export const NODE_REGISTRY: NodeDefinition[] = [
  // TRIGGERS
  { type: 'trigger.schedule', category: 'trigger', label: 'Schedule', description: 'Run workflow on a cron schedule', icon: '⏰', color: '#f5a623',
    inputs: [], outputs: [{ id: 'out', label: 'Trigger Data', type: 'object' }],
    configSchema: { cron: { label: 'Cron Expression', type: 'text', placeholder: '0 9 * * MON-FRI' }, timezone: { label: 'Timezone', type: 'select', options: ['UTC', 'America/New_York', 'Europe/London', 'Asia/Kolkata'] } }
  },
  { type: 'trigger.webhook', category: 'trigger', label: 'Webhook', description: 'Trigger via HTTP POST', icon: '🔔', color: '#f5a623',
    inputs: [], outputs: [{ id: 'out', label: 'Request Body', type: 'object' }],
    configSchema: { path: { label: 'Webhook Path', type: 'text', placeholder: '/my-webhook' }, secret: { label: 'Signing Secret', type: 'text' } }
  },

  // AI ACTIONS
  { type: 'action.ai', category: 'ai', label: 'AI Prompt', description: 'Send a prompt to any LLM', icon: '🤖', color: '#8b5cf6',
    inputs: [{ id: 'in', label: 'Context', type: 'any' }], outputs: [{ id: 'response', label: 'AI Response', type: 'string' }],
    configSchema: {
      provider: { label: 'Provider', type: 'select', options: ['anthropic', 'openai', 'groq', 'gemini'] },
      model: { label: 'Model', type: 'text', placeholder: 'claude-sonnet-4-6' },
      system: { label: 'System Prompt', type: 'textarea' },
      prompt: { label: 'User Prompt (use {{variables}})', type: 'textarea', required: true }
    }
  },

  // HTTP / API
  { type: 'action.http', category: 'action', label: 'HTTP Request', description: 'Make an HTTP request to any URL', icon: '🌐', color: '#10d9a0',
    inputs: [{ id: 'in', label: 'Input', type: 'any' }], outputs: [{ id: 'response', label: 'Response', type: 'object' }, { id: 'status', label: 'Status Code', type: 'number' }],
    configSchema: {
      method: { label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
      url: { label: 'URL', type: 'text', required: true, placeholder: 'https://api.example.com/data' },
      headers: { label: 'Headers (JSON)', type: 'textarea', placeholder: '{"Authorization": "Bearer {{token}}"}' },
      body: { label: 'Body (JSON)', type: 'textarea' }
    }
  },

  // EMAIL
  { type: 'action.email', category: 'action', label: 'Send Email', description: 'Send email via Resend', icon: '📧', color: '#00d4ff',
    inputs: [{ id: 'in', label: 'Data', type: 'object' }], outputs: [{ id: 'id', label: 'Message ID', type: 'string' }],
    configSchema: {
      to: { label: 'To', type: 'text', required: true },
      subject: { label: 'Subject', type: 'text', required: true },
      body: { label: 'Email Body (HTML)', type: 'textarea', required: true }
    }
  },

  // LOGIC
  { type: 'logic.if', category: 'logic', label: 'If / Else', description: 'Branch based on condition', icon: '🔀', color: '#ff5050',
    inputs: [{ id: 'in', label: 'Input', type: 'any' }], outputs: [{ id: 'true', label: 'True Branch', type: 'any' }, { id: 'false', label: 'False Branch', type: 'any' }],
    configSchema: {
      condition: { label: 'Condition (JS expression)', type: 'text', required: true, placeholder: '{{status}} === "active"' },
    }
  },
  { type: 'logic.delay', category: 'logic', label: 'Delay', description: 'Wait before continuing', icon: '⏳', color: '#ff5050',
    inputs: [{ id: 'in', label: 'Input', type: 'any' }], outputs: [{ id: 'out', label: 'Output', type: 'any' }],
    configSchema: { duration: { label: 'Duration (seconds)', type: 'number' } }
  },
]
