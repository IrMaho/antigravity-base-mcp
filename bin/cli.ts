#!/usr/bin/env node
import { BaseMCPServer } from '../src/server';
import { createDefaultToolRegistry } from '../src/tools';
import { createDefaultResourceManager } from '../src/resources';
import { createDefaultPromptManager } from '../src/prompts';

function parsePayload(raw: string): Record<string, unknown> {
  if (!raw || raw.trim() === '' || raw.trim() === '{}') return {};
  let sanitized = raw.trim();

  // Strip PowerShell escaping backslashes if present
  sanitized = sanitized.replace(/\\"/g, '"').replace(/\\([a-zA-Z0-9_]+)\\/g, '$1');

  // 1. Try standard JSON.parse
  try {
    return JSON.parse(sanitized);
  } catch {}

  // 2. Try JS object expression evaluation
  try {
    const fn = new Function(`return (${sanitized});`);
    const val = fn();
    if (typeof val === 'object' && val !== null) {
      // Clean keys
      const cleanObj: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val)) {
        const cleanK = k.replace(/^\\+|\\+$/g, '').replace(/^:+|:+$/g, '');
        cleanObj[cleanK] = v;
      }
      return cleanObj;
    }
  } catch {}

  // 3. Try key=value format (e.g. message=hello repeat=2)
  try {
    const result: Record<string, unknown> = {};
    const pairs = sanitized.replace(/^\{|\}$/g, '').split(/[\s,]+/);
    for (const pair of pairs) {
      if (pair.includes(':') || pair.includes('=')) {
        const [k, ...rest] = pair.split(/[:=]/);
        const key = k.trim().replace(/^["'\\]+|["'\\]+$/g, '');
        let valStr = rest.join(':').trim().replace(/^["'\\]+|["'\\]+$/g, '');
        if (valStr === 'true') result[key] = true;
        else if (valStr === 'false') result[key] = false;
        else if (!isNaN(Number(valStr)) && valStr !== '') result[key] = Number(valStr);
        else result[key] = valStr;
      }
    }
    if (Object.keys(result).length > 0) return result;
  } catch {}

  throw new Error(`Unable to parse payload into JSON object: ${raw}`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const toolRegistry = createDefaultToolRegistry();
  const resourceManager = createDefaultResourceManager();
  const promptManager = createDefaultPromptManager();

  switch (command) {
    case 'list':
    case 'tools': {
      console.log('\n=== Registered MCP Tools ===\n');
      const tools = toolRegistry.listTools();
      for (const tool of tools) {
        console.log(`🔧 \x1b[36m${tool.name}\x1b[0m`);
        console.log(`   ${tool.description}`);
        const props = Object.keys(tool.inputSchema.properties || {});
        if (props.length > 0) {
          console.log(`   Parameters: ${props.join(', ')}`);
        }
        console.log();
      }
      break;
    }

    case 'call': {
      const toolName = args[1];
      if (!toolName) {
        console.error('Error: Please specify tool name. Example: npm run cli call echo \'{"message":"hi"}\'');
        process.exit(1);
      }
      const rawPayload = args.slice(2).join(' ') || '{}';
      let payload: Record<string, unknown>;
      try {
        payload = parsePayload(rawPayload);
      } catch (e: any) {
        console.error(`Error: ${e.message}`);
        process.exit(1);
      }

      console.log(`\nCalling tool '\x1b[36m${toolName}\x1b[0m' with arguments:`, payload);
      const result = await toolRegistry.executeTool(toolName, payload);
      console.log('\nResult:');
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    case 'resources': {
      console.log('\n=== Registered MCP Resources ===\n');
      const resources = resourceManager.listResources();
      for (const res of resources) {
        console.log(`📄 \x1b[33m${res.uri}\x1b[0m (${res.name})`);
        if (res.description) console.log(`   ${res.description}`);
        console.log();
      }
      break;
    }

    case 'prompts': {
      console.log('\n=== Registered MCP Prompts ===\n');
      const prompts = promptManager.listPrompts();
      for (const p of prompts) {
        console.log(`💡 \x1b[35m${p.name}\x1b[0m`);
        if (p.description) console.log(`   ${p.description}`);
        console.log();
      }
      break;
    }

    case 'serve': {
      console.log('Starting MCP Server on Stdio...');
      const server = new BaseMCPServer({ toolRegistry, resourceManager, promptManager });
      await server.start();
      break;
    }

    case 'help':
    default: {
      console.log(`
=== Base MCP Server CLI ===

Usage:
  npm run cli list                 List all registered tools
  npm run cli call <tool> <json>   Call a tool directly with JSON args
  npm run cli resources            List all registered resources
  npm run cli prompts              List all registered prompts
  npm run cli serve                Start server on stdio
  npm run new-tool <tool_name>     Generate a new tool scaffolding
  npm run test:stdio               Run end-to-end MCP protocol tests
`);
      break;
    }
  }
}

main().catch((err) => {
  console.error('CLI Error:', err);
  process.exit(1);
});
