/**
 * Model Context Protocol (MCP) & JSON-RPC 2.0 Core Types
 * Specification Version: 2024-11-05
 */

// ==========================================
// JSON-RPC 2.0 Base Types
// ==========================================

export interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

export interface JSONRPCNotification {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
}

export interface JSONRPCResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: JSONRPCError;
}

export interface JSONRPCError {
  code: number;
  message: string;
  data?: unknown;
}

// ==========================================
// MCP Protocol Capabilities & Server Info
// ==========================================

export interface ServerInfo {
  name: string;
  version: string;
}

export interface ClientInfo {
  name: string;
  version: string;
}

export interface ServerCapabilities {
  tools?: {
    listChanged?: boolean;
  };
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  prompts?: {
    listChanged?: boolean;
  };
  logging?: Record<string, unknown>;
}

export interface InitializeResult {
  protocolVersion: string;
  capabilities: ServerCapabilities;
  serverInfo: ServerInfo;
  instructions?: string;
}

// ==========================================
// MCP Tool Types
// ==========================================

export interface ToolInputSchema {
  type: 'object';
  properties: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
}

export interface MCPContentText {
  type: 'text';
  text: string;
}

export interface MCPContentImage {
  type: 'image';
  data: string;
  mimeType: string;
}

export interface MCPContentResource {
  type: 'resource';
  resource: {
    uri: string;
    mimeType?: string;
    text?: string;
    blob?: string;
  };
}

export type MCPContentItem = MCPContentText | MCPContentImage | MCPContentResource;

export interface MCPToolCallResult {
  content: MCPContentItem[];
  isError?: boolean;
}

// ==========================================
// MCP Resource Types
// ==========================================

export interface MCPResourceDefinition {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPResourceContent {
  uri: string;
  mimeType?: string;
  text?: string;
  blob?: string;
}

// ==========================================
// MCP Prompt Types
// ==========================================

export interface MCPPromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

export interface MCPPromptDefinition {
  name: string;
  description?: string;
  arguments?: MCPPromptArgument[];
}

export interface MCPPromptMessage {
  role: 'user' | 'assistant';
  content: MCPContentItem;
}

export interface MCPPromptResult {
  description?: string;
  messages: MCPPromptMessage[];
}
