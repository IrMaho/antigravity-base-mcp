import {
  JSONRPCRequest,
  JSONRPCResponse,
  InitializeResult,
} from './core/types';
import { StdioTransport, Transport } from './core/transport';
import { Logger } from './core/logger';
import { MCPError, ErrorCode } from './core/errors';
import { ServerConfig, DEFAULT_CONFIG } from './config';
import { ToolRegistry, createDefaultToolRegistry } from './tools';
import { ResourceManager, createDefaultResourceManager } from './resources';
import { PromptManager, createDefaultPromptManager } from './prompts';

export interface MCPServerOptions {
  config?: Partial<ServerConfig>;
  toolRegistry?: ToolRegistry;
  resourceManager?: ResourceManager;
  promptManager?: PromptManager;
  transport?: Transport;
}

export class BaseMCPServer {
  private config: ServerConfig;
  private toolRegistry: ToolRegistry;
  private resourceManager: ResourceManager;
  private promptManager: PromptManager;
  private transport: Transport;
  private initialized: boolean = false;

  constructor(options?: MCPServerOptions) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...options?.config,
      info: {
        ...DEFAULT_CONFIG.info,
        ...options?.config?.info,
      },
    };

    if (this.config.logLevel) {
      Logger.setLevel(this.config.logLevel);
    }
    if (this.config.logFile) {
      Logger.setLogFile(this.config.logFile);
    }

    this.toolRegistry = options?.toolRegistry || createDefaultToolRegistry();
    this.resourceManager = options?.resourceManager || createDefaultResourceManager();
    this.promptManager = options?.promptManager || createDefaultPromptManager();
    this.transport = options?.transport || new StdioTransport();

    Logger.info(`BaseMCPServer instantiated: ${this.config.info.name} v${this.config.info.version}`);
  }

  /**
   * Access the ToolRegistry to add or remove tools dynamically
   */
  public getTools(): ToolRegistry {
    return this.toolRegistry;
  }

  /**
   * Access the ResourceManager
   */
  public getResources(): ResourceManager {
    return this.resourceManager;
  }

  /**
   * Access the PromptManager
   */
  public getPrompts(): PromptManager {
    return this.promptManager;
  }

  /**
   * Main JSON-RPC request dispatcher
   */
  public async handleRequest(request: JSONRPCRequest): Promise<JSONRPCResponse | null> {
    const { method, params, id } = request;

    // JSON-RPC 2.0: Notifications do not receive a response
    if (id === undefined || id === null) {
      if (method === 'notifications/initialized' || method === 'initialized') {
        this.initialized = true;
        Logger.info('Client confirmed initialization');
      }
      return null;
    }

    try {
      // 1. Initialize
      if (method === 'initialize') {
        const result: InitializeResult = {
          protocolVersion: this.config.protocolVersion,
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
            prompts: { listChanged: false },
            logging: {},
          },
          serverInfo: this.config.info,
          ...(this.config.instructions ? { instructions: this.config.instructions } : {}),
        };

        return { jsonrpc: '2.0', id, result };
      }

      // 2. Ping
      if (method === 'ping') {
        return { jsonrpc: '2.0', id, result: {} };
      }

      // 3. Tools / List
      if (method === 'tools/list') {
        const tools = this.toolRegistry.listTools();
        Logger.debug(`tools/list called. Returning ${tools.length} tools.`);
        return {
          jsonrpc: '2.0',
          id,
          result: { tools },
        };
      }

      // 4. Tools / Call
      if (method === 'tools/call') {
        const toolName = (params as any)?.name;
        const toolArgs = (params as any)?.arguments || {};
        Logger.info(`Calling tool: ${toolName}`, { toolArgs });

        const result = await this.toolRegistry.executeTool(toolName, toolArgs);
        return {
          jsonrpc: '2.0',
          id,
          result,
        };
      }

      // 5. Resources / List
      if (method === 'resources/list') {
        const resources = this.resourceManager.listResources();
        return {
          jsonrpc: '2.0',
          id,
          result: { resources },
        };
      }

      // 6. Resources / Templates List
      if (method === 'resources/templates/list') {
        return {
          jsonrpc: '2.0',
          id,
          result: { resourceTemplates: [] },
        };
      }

      // 7. Resources / Read
      if (method === 'resources/read') {
        const uri = (params as any)?.uri || '';
        try {
          const content = await this.resourceManager.readResource(uri);
          return {
            jsonrpc: '2.0',
            id,
            result: { contents: [content] },
          };
        } catch (err: any) {
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: ErrorCode.RESOURCE_NOT_FOUND,
              message: err.message,
            },
          };
        }
      }

      // 8. Prompts / List
      if (method === 'prompts/list') {
        const prompts = this.promptManager.listPrompts();
        return {
          jsonrpc: '2.0',
          id,
          result: { prompts },
        };
      }

      // 9. Prompts / Get
      if (method === 'prompts/get') {
        const promptName = (params as any)?.name;
        const promptArgs = (params as any)?.arguments;
        try {
          const promptResult = await this.promptManager.getPrompt(promptName, promptArgs);
          return {
            jsonrpc: '2.0',
            id,
            result: promptResult,
          };
        } catch (err: any) {
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: ErrorCode.PROMPT_NOT_FOUND,
              message: err.message,
            },
          };
        }
      }

      // 10. Logging / SetLevel
      if (method === 'logging/setLevel') {
        const level = (params as any)?.level;
        if (level) {
          Logger.setLevel(level);
        }
        return { jsonrpc: '2.0', id, result: {} };
      }

      // 11. Completion / Complete
      if (method === 'completion/complete') {
        return {
          jsonrpc: '2.0',
          id,
          result: { completion: { values: [], hasMore: false } },
        };
      }

      // 12. Roots / List
      if (method === 'roots/list') {
        return {
          jsonrpc: '2.0',
          id,
          result: { roots: [] },
        };
      }

      // Unknown method
      Logger.warn(`Unhandled JSON-RPC method: ${method}`);
      return {
        jsonrpc: '2.0',
        id,
        error: MCPError.methodNotFound(method).toJSONRPCError(),
      };
    } catch (err: any) {
      Logger.error(`Error processing request ${method}: ${err.message}`, { stack: err.stack });
      return {
        jsonrpc: '2.0',
        id,
        error: MCPError.internalError(err.message).toJSONRPCError(),
      };
    }
  }

  /**
   * Start the MCP server using standard Stdio transport
   */
  public async start(): Promise<void> {
    Logger.info(`Starting ${this.config.info.name} v${this.config.info.version} over Stdio transport`);
    await this.transport.start(this.handleRequest.bind(this));
  }

  /**
   * Stop the server
   */
  public async stop(): Promise<void> {
    Logger.info('Stopping BaseMCPServer');
    await this.transport.close();
  }
}
