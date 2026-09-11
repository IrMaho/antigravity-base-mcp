import { BaseTool } from './base-tool';
import { MCPToolDefinition, MCPToolCallResult } from '../core/types';
import { Logger } from '../core/logger';

export class ToolRegistry {
  private tools: Map<string, BaseTool<any>> = new Map();

  /**
   * Register a new tool
   */
  public register(tool: BaseTool<any>): this {
    if (this.tools.has(tool.name)) {
      Logger.warn(`Tool with name '${tool.name}' is already registered. Overwriting.`);
    }
    this.tools.set(tool.name, tool);
    Logger.debug(`Registered MCP tool: ${tool.name}`);
    return this;
  }

  /**
   * Register multiple tools at once
   */
  public registerMany(tools: BaseTool<any>[]): this {
    for (const tool of tools) {
      this.register(tool);
    }
    return this;
  }

  /**
   * Get a tool by name
   */
  public getTool(name: string): BaseTool<any> | undefined {
    return this.tools.get(name);
  }

  /**
   * Check if a tool is registered
   */
  public hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Returns list of tool definitions formatted for MCP tools/list
   */
  public listTools(): MCPToolDefinition[] {
    return Array.from(this.tools.values()).map((tool) => tool.getDefinition());
  }

  /**
   * Execute a tool by name with raw arguments
   */
  public async executeTool(
    name: string,
    args: Record<string, unknown>,
    context?: Record<string, unknown>
  ): Promise<MCPToolCallResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      Logger.warn(`Attempted to execute non-existent tool: ${name}`);
      return {
        content: [{ type: 'text', text: `Tool '${name}' not found. Available tools: ${Array.from(this.tools.keys()).join(', ')}` }],
        isError: true,
      };
    }

    return await tool.run(args, context);
  }

  /**
   * Count of registered tools
   */
  public get size(): number {
    return this.tools.size;
  }

  /**
   * Get all registered tool names
   */
  public getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }
}
