/**
 * @file OrchEndpoints.ts
 * @description
 * REST API route path definitions and dynamic parameterized URI builder functions for the AWH AI Platform / Orchestration Service.
 * Standardizes URI paths across AI Chat, Streaming, Knowledge Base RAG, Memory, Workflows, MCP,
 * Chatbot Builder, WhatsApp Webhooks/Bots, and Voice Agent sessions.
 *
 * Responsibilities:
 * - Define static URL routes for all Orchestration / AI Platform endpoints.
 * - Provide dynamic path-builder functions for parameterized resource URIs (e.g. `/api/v1/ai/stream/${conversationId}`).
 * - Link each endpoint group to its corresponding OpenAPI/Swagger documentation schema.
 *
 * Major Objects:
 * - {@link ORCH} - Frozen dictionary containing endpoint strings and URI builder functions.
 *
 * Dependencies:
 * - None (pure constants and string functions).
 *
 * Assumptions:
 * - The AWH AI Platform / Orchestration API service is hosted at base port 3001 (e.g. `http://13.205.179.0:3001`).
 * - Swagger documentation is accessible at `/api/docs`.
 *
 * Side Effects:
 * - None. All properties are immutable route path strings or pure helper functions.
 *
 * Usage Considerations:
 * - Always use `ORCH` endpoint constants in API tests rather than hardcoding route strings.
 */

/**
 * AWH AI Platform API — Endpoint Route Paths and Dynamic URI Builders (Orchestration Service).
 * Base URL: http://13.205.179.0:3001
 * Swagger Docs: http://13.205.179.0:3001/api/docs
 */
export const ORCH = {

  // ── Health ─────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Health
  /** Health check endpoint */
  HEALTH: '/api/v1/health',
  /** Readiness probe endpoint */
  READY: '/api/v1/health/ready',

  // ── Authentication ─────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Authentication
  /** Verify authentication token */
  AUTH_VERIFY: '/api/v1/auth/verify',
  /** Development authentication token generator */
  AUTH_DEV_TOKEN: '/api/v1/auth/token',

  // ── AI Chat ────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/AI%20Chat
  /** Synchronous AI chat conversation */
  AI_CHAT: '/api/v1/ai/chat',

  // ── AI Streaming ───────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/AI%20Streaming
  /** Server-Sent Events (SSE) AI streaming endpoint by conversation ID */
  AI_STREAM: (conversationId: string): string => `/api/v1/ai/stream/${conversationId}`,

  // ── Knowledge Base ─────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Knowledge%20Base
  /** Upload document to AI Knowledge Base */
  KNOWLEDGE_UPLOAD: '/api/v1/ai/knowledge/upload',
  /** Semantic vector search against Knowledge Base */
  KNOWLEDGE_SEARCH: '/api/v1/ai/knowledge',

  // ── Memory ─────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Memory
  /** Search conversation memory embeddings */
  MEMORY_SEARCH: '/api/v1/ai/memory/search',

  // ── Workflows ──────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Workflows
  /** AI agent workflow state by workflow ID */
  WORKFLOW: (workflowId: string): string => `/api/v1/ai/workflow/${workflowId}`,
  /** Resume paused AI agent workflow by workflow ID */
  WORKFLOW_RESUME: (workflowId: string): string => `/api/v1/ai/workflow/${workflowId}/resume`,

  // ── MCP ────────────────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/McpHttp
  /** Model Context Protocol (MCP) HTTP interface */
  MCP: '/api/v1/mcp',

  // ── Admin — Organization Domains ───────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Admin%20—%20Organization%20Domains
  /** Organization domain configuration */
  ADMIN_ORG_DOMAIN: (orgId: string): string => `/api/v1/admin/organizations/${orgId}/domain`,
  /** Organization domain settings and verification */
  ADMIN_ORG_DOMAIN_CONFIG: (orgId: string): string => `/api/v1/admin/organizations/${orgId}/domain/config`,

  // ── Chatbot Builder ────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Chatbot%20Builder
  /** Create or retrieve chatbot builder session */
  CHATBOT_SESSION: '/api/v1/chatbot-builder/session',
  /** Interactive chat session with chatbot builder agent */
  CHATBOT_CHAT: '/api/v1/chatbot-builder/chat',
  /** Deploy built chatbot to production */
  CHATBOT_DEPLOY: '/api/v1/chatbot-builder/deploy',
  /** Chatbot instance management by bot ID */
  CHATBOT_BOT: (botId: string): string => `/api/v1/chatbot-builder/bots/${botId}`,
  /** Associated documents for chatbot by bot ID */
  CHATBOT_BOT_DOCS: (botId: string): string => `/api/v1/chatbot-builder/bots/${botId}/documents`,

  // ── WhatsApp Webhooks ──────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/WhatsApp
  /** Meta WhatsApp cloud API webhook handler */
  WHATSAPP_WEBHOOK: '/api/v1/webhooks/whatsapp',
  /** Meta WhatsApp interactive flow data exchange */
  WHATSAPP_FLOW_EXCHANGE: '/api/v1/whatsapp/webhooks/meta/flow',

  // ── WhatsApp Bots ──────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/WhatsApp%20Bots
  /** WhatsApp bot configurations list */
  WHATSAPP_BOTS: '/api/v1/whatsapp/bots',
  /** WhatsApp bot configuration by ID */
  WHATSAPP_BOT: (id: string): string => `/api/v1/whatsapp/bots/${id}`,

  // ── WhatsApp Conversations ─────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/WhatsApp%20Conversations
  /** Active WhatsApp conversations collection */
  WHATSAPP_CONVERSATIONS: '/api/v1/whatsapp/conversations',
  /** WhatsApp conversation thread by ID */
  WHATSAPP_CONVERSATION: (id: string): string => `/api/v1/whatsapp/conversations/${id}`,
  /** WhatsApp messages in conversation by ID */
  WHATSAPP_MESSAGES: (id: string): string => `/api/v1/whatsapp/conversations/${id}/messages`,

  // ── WhatsApp Messages ──────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/WhatsApp%20Messages
  /** WhatsApp message delivery status by message ID */
  WHATSAPP_MSG_STATUS: (waMessageId: string): string => `/api/v1/whatsapp/messages/${waMessageId}/status`,
  /** Send outbound WhatsApp plain text message */
  WHATSAPP_SEND_TEXT: '/api/v1/whatsapp/messages/text',
  /** Send outbound WhatsApp template message */
  WHATSAPP_SEND_TEMPLATE: '/api/v1/whatsapp/messages/template',

  // ── WhatsApp Template Config ───────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/WhatsApp%20Template%20Config
  /** WhatsApp template configurations collection */
  WHATSAPP_TEMPLATE_CONFIGS: '/api/v1/whatsapp/template-config',
  /** WhatsApp template configuration by ID */
  WHATSAPP_TEMPLATE_CONFIG_BY_ID: (id: string): string => `/api/v1/whatsapp/template-config/${id}`,
  /** Synchronize approved WhatsApp templates from Meta */
  WHATSAPP_TEMPLATE_SYNC: '/api/v1/whatsapp/template-config/sync',

  // ── Voice Sessions ─────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Voice%20Sessions
  /** Active telephony voice sessions */
  VOICE_SESSIONS: '/api/v1/voice/sessions',
  /** Voice session state by session ID */
  VOICE_SESSION: (sessionId: string): string => `/api/v1/voice/sessions/${sessionId}`,

  // ── Voice Agents ───────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Voice%20Agents
  /** AI Voice agents collection */
  VOICE_AGENTS: '/api/v1/voice/agents',
  /** AI Voice agent configuration by ID */
  VOICE_AGENT: (id: string): string => `/api/v1/voice/agents/${id}`,

  // ── Voice Call Logs ────────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Voice%20Call%20Logs
  /** Voice call history records */
  VOICE_CALLS: '/api/v1/voice/calls',
  /** Voice call log details by session ID */
  VOICE_CALL: (sessionId: string): string => `/api/v1/voice/calls/${sessionId}`,
  /** Voice call audio transcripts by session ID */
  VOICE_CALL_TRANSCRIPTS: (sessionId: string): string => `/api/v1/voice/calls/${sessionId}/transcripts`,
  /** Initiate outbound telephony voice call */
  VOICE_OUTBOUND_CALL: '/api/v1/voice/calls/outbound',

  // ── Telephony Numbers ──────────────────────────────────────────────
  // Docs: http://13.205.179.0:3001/api/docs#/Telephony%20Numbers
  /** Provisioned virtual telephony phone numbers */
  TELEPHONY_NUMBERS: '/api/v1/voice/numbers',
  /** Telephony number configuration by ID */
  TELEPHONY_NUMBER: (id: string): string => `/api/v1/voice/numbers/${id}`,
};
