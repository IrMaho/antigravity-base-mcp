import { ServerInfo } from '../core/types';

export interface ServerConfig {
  info: ServerInfo;
  protocolVersion: string;
  instructions?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'none';
  logFile?: string;
}

export const DEFAULT_CONFIG: ServerConfig = {
  info: {
    name: process.env.MCP_SERVER_NAME || 'custom-mcp-server',
    version: process.env.MCP_SERVER_VERSION || '1.0.0',
  },
  protocolVersion: '2024-11-05',
  instructions:
    'Custom MCP Server for AI Agent assistance. Provides specialized tools, prompts, and resources for project workflows.',
  logLevel: (process.env.MCP_LOG_LEVEL as any) || 'info',
  logFile: process.env.MCP_LOG_FILE || undefined,
};
