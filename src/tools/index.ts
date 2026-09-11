import { ToolRegistry } from './registry';
import { BaseTool } from './base-tool';
import { EchoTool } from './examples/echo.tool';
import { SystemInfoTool } from './examples/system-info.tool';
import { MyCustomTool } from './examples/custom-template.tool';

export { ToolRegistry, BaseTool };
export { EchoTool, SystemInfoTool, MyCustomTool };

/**
 * Creates and registers all MCP tools for the server.
 * When you add a new tool, register it here!
 */
export function createDefaultToolRegistry(): ToolRegistry {
  const registry = new ToolRegistry();

  // Register built-in sample tools
  registry.register(new EchoTool());
  registry.register(new SystemInfoTool());
  registry.register(new MyCustomTool());

  // === Register your custom tools below ===
  // registry.register(new YourNewTool());

  return registry;
}
