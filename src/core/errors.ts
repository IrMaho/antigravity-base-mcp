import { JSONRPCError } from './types';

export enum ErrorCode {
  // Standard JSON-RPC 2.0 errors
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,

  // Custom MCP errors
  TOOL_NOT_FOUND = -32001,
  TOOL_EXECUTION_ERROR = -32002,
  RESOURCE_NOT_FOUND = -32003,
  PROMPT_NOT_FOUND = -32004,
  VALIDATION_ERROR = -32005,
  UNAUTHORIZED = -32006,
}

export class MCPError extends Error {
  public readonly code: number;
  public readonly data?: unknown;

  constructor(code: number, message: string, data?: unknown) {
    super(message);
    this.name = 'MCPError';
    this.code = code;
    this.data = data;
    Object.setPrototypeOf(this, MCPError.prototype);
  }

  public toJSONRPCError(): JSONRPCError {
    return {
      code: this.code,
      message: this.message,
      ...(this.data !== undefined ? { data: this.data } : {}),
    };
  }

  public static parseError(message: string = 'Parse error'): MCPError {
    return new MCPError(ErrorCode.PARSE_ERROR, message);
  }

  public static invalidRequest(message: string = 'Invalid Request'): MCPError {
    return new MCPError(ErrorCode.INVALID_REQUEST, message);
  }

  public static methodNotFound(method: string): MCPError {
    return new MCPError(ErrorCode.METHOD_NOT_FOUND, `Method '${method}' not found`);
  }

  public static invalidParams(message: string, details?: unknown): MCPError {
    return new MCPError(ErrorCode.INVALID_PARAMS, message, details);
  }

  public static internalError(message: string = 'Internal error', details?: unknown): MCPError {
    return new MCPError(ErrorCode.INTERNAL_ERROR, message, details);
  }

  public static toolNotFound(toolName: string): MCPError {
    return new MCPError(ErrorCode.TOOL_NOT_FOUND, `Tool '${toolName}' not found`);
  }

  public static resourceNotFound(uri: string): MCPError {
    return new MCPError(ErrorCode.RESOURCE_NOT_FOUND, `Resource '${uri}' not found`);
  }

  public static promptNotFound(promptName: string): MCPError {
    return new MCPError(ErrorCode.PROMPT_NOT_FOUND, `Prompt '${promptName}' not found`);
  }
}
