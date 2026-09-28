/**
 * AWH AI Platform API — Endpoint Constants (Orchestration Service)
 * Base URL: http://13.205.179.0:3001
 * Swagger Docs: http://13.205.179.0:3001/api/docs
 *
 * Every endpoint has a Swagger doc link for traceability.
 */
export const ORCH = {

  // ── Health ─────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Health
  HEALTH: '/api/v1/health',
  READY: '/api/v1/health/ready',

  // ── Authentication ─────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Authentication
  AUTH_VERIFY: '/api/v1/auth/verify',
  AUTH_DEV_TOKEN: '/api/v1/auth/token',

  // ── AI Chat ────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/AI%20Chat
  AI_CHAT: '/api/v1/ai/chat',

  // ── AI Streaming ───────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/AI%20Streaming
  AI_STREAM: (conversationId: string) => `/api/v1/ai/stream/${conversationId}`,

  // ── Knowledge Base ─────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Knowledge%20Base
  KNOWLEDGE_UPLOAD: '/api/v1/ai/knowledge/upload',
  KNOWLEDGE_SEARCH: '/api/v1/ai/knowledge',

  // ── Memory ─────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Memory
  MEMORY_SEARCH: '/api/v1/ai/memory/search',

  // ── Workflows ──────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Workflows
  WORKFLOW: (workflowId: string) => `/api/v1/ai/workflow/${workflowId}`,
  WORKFLOW_RESUME: (workflowId: string) => `/api/v1/ai/workflow/${workflowId}/resume`,

  // ── MCP ────────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/McpHttp
  MCP: '/api/v1/mcp',

  // ── Admin — Organization Domains ───────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Admin%20—%20Organization%20Domains
  ADMIN_ORG_DOMAIN: (orgId: string) => `/api/v1/admin/organizations/${orgId}/domain`,
  ADMIN_ORG_DOMAIN_CONFIG: (orgId: string) => `/api/v1/admin/organizations/${orgId}/domain/config`,

  // ── Chatbot Builder ────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Chatbot%20Builder
  CHATBOT_SESSION: '/api/v1/chatbot-builder/session',
  CHATBOT_CHAT: '/api/v1/chatbot-builder/chat',
  CHATBOT_DEPLOY: '/api/v1/chatbot-builder/deploy',
  CHATBOT_BOT: (botId: string) => `/api/v1/chatbot-builder/bots/${botId}`,
  CHATBOT_BOT_DOCS: (botId: string) => `/api/v1/chatbot-builder/bots/${botId}/documents`,

  // ── WhatsApp Webhooks ──────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/WhatsApp
  WHATSAPP_WEBHOOK: '/api/v1/webhooks/whatsapp',
  WHATSAPP_FLOW_EXCHANGE: '/api/v1/whatsapp/webhooks/meta/flow',

  // ── WhatsApp Bots ──────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/WhatsApp%20Bots
  WHATSAPP_BOTS: '/api/v1/whatsapp/bots',
  WHATSAPP_BOT: (id: string) => `/api/v1/whatsapp/bots/${id}`,

  // ── WhatsApp Conversations ─────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/WhatsApp%20Conversations
  WHATSAPP_CONVERSATIONS: '/api/v1/whatsapp/conversations',
  WHATSAPP_CONVERSATION: (id: string) => `/api/v1/whatsapp/conversations/${id}`,
  WHATSAPP_MESSAGES: (id: string) => `/api/v1/whatsapp/conversations/${id}/messages`,

  // ── WhatsApp Messages ──────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/WhatsApp%20Messages
  WHATSAPP_MSG_STATUS: (waMessageId: string) => `/api/v1/whatsapp/messages/${waMessageId}/status`,
  WHATSAPP_SEND_TEXT: '/api/v1/whatsapp/messages/text',
  WHATSAPP_SEND_TEMPLATE: '/api/v1/whatsapp/messages/template',

  // ── WhatsApp Template Config ───────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/WhatsApp%20Template%20Config
  WHATSAPP_TEMPLATE_CONFIGS: '/api/v1/whatsapp/template-config',
  WHATSAPP_TEMPLATE_CONFIG_BY_ID: (id: string) => `/api/v1/whatsapp/template-config/${id}`,
  WHATSAPP_TEMPLATE_SYNC: '/api/v1/whatsapp/template-config/sync',

  // ── Voice Sessions ─────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Voice%20Sessions
  VOICE_SESSIONS: '/api/v1/voice/sessions',
  VOICE_SESSION: (sessionId: string) => `/api/v1/voice/sessions/${sessionId}`,

  // ── Voice Agents ───────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Voice%20Agents
  VOICE_AGENTS: '/api/v1/voice/agents',
  VOICE_AGENT: (id: string) => `/api/v1/voice/agents/${id}`,

  // ── Voice Call Logs ────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Voice%20Call%20Logs
  VOICE_CALLS: '/api/v1/voice/calls',
  VOICE_CALL: (sessionId: string) => `/api/v1/voice/calls/${sessionId}`,
  VOICE_CALL_TRANSCRIPTS: (sessionId: string) => `/api/v1/voice/calls/${sessionId}/transcripts`,
  VOICE_OUTBOUND_CALL: '/api/v1/voice/calls/outbound',

  // ── Telephony Numbers ──────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Telephony%20Numbers
  TELEPHONY_NUMBERS: '/api/v1/voice/numbers',
  TELEPHONY_NUMBER: (id: string) => `/api/v1/voice/numbers/${id}`,
};
