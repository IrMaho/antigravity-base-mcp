# 🚀 Base MCP Server Template (Model Context Protocol Starter Kit)

An enterprise-grade, clean, and extensible **Base MCP (Model Context Protocol) Server Template** built with **TypeScript**, **Zod**, **Vite**, and **Vitest**.

Designed to be your foundational starter kit: whenever you need a new MCP server with custom tools for a new project, simply **copy this directory**, define your tools in `src/tools/`, and use it instantly across **Claude Desktop**, **Google Antigravity**, **Cursor**, and **VS Code**.

---

## 🌟 Key Features

- ⚡ **Strict Protocol Compliance**: Implements MCP Specification `2024-11-05` and JSON-RPC 2.0 (`initialize`, `ping`, `tools/list`, `tools/call`, `resources/list`, `resources/read`, `prompts/list`, `prompts/get`, `completion/complete`).
- 🛡️ **Zero Stdout Pollution**: Clean Stdio transport with all logger output strictly routed to `stderr` and optional file logging.
- 🧩 **Modular Tool Architecture**: Abstract `BaseTool` class with automatic **Zod** schema-to-JSON-Schema conversion and safe runtime validation.
- 🛠️ **Instant Tool Generator**: Run `npm run new-tool <tool_name>` to scaffold a new tool with types and schema in seconds.
- 🧪 **Complete Test Suite**: Integrated **Vitest** unit tests and real-stdio end-to-end integration tests (`npm run test:all`).
- 🖥️ **Windows 1-Click Automation**: `.bat` files for installation, building, testing, and running.
- 📖 **Bilingual Guides**: Includes English and comprehensive Persian documentation (`GUIDE_FA.md`).

---

## 📁 Directory Structure

```
base_mcp/
├── .agents/
│   └── skills/
│       └── base-mcp-starter/
│           └── SKILL.md            # AI Agent skill documentation
├── bin/
│   ├── cli.ts                      # Interactive Developer CLI
│   ├── mcp-server.ts               # Direct TS runner
│   └── mcp-server.js               # Node.js entrypoint
├── src/
│   ├── index.ts                    # Main library exports
│   ├── server.ts                   # Core BaseMCPServer JSON-RPC router
│   ├── config/
│   │   └── index.ts                # Server configuration & environment
│   ├── core/
│   │   ├── types.ts                # Protocol types
│   │   ├── logger.ts               # Stderr / file logger
│   │   ├── errors.ts               # JSON-RPC error codes & classes
│   │   └── transport.ts            # Stdio transport engine
│   ├── tools/
│   │   ├── base-tool.ts            # Abstract base tool with Zod parsing
│   │   ├── registry.ts             # Central tool registry
│   │   ├── index.ts                # Tool registry loader & registrations
│   │   └── examples/
│   │       ├── echo.tool.ts        # Echo sample tool
│   │       ├── system-info.tool.ts # System diagnostics sample tool
│   │       └── custom-template.tool.ts # Copy-paste blueprint
│   ├── resources/
│   │   ├── index.ts                # Resource manager
│   │   └── examples/
│   │       └── sample-resource.ts  # Sample dynamic resource
│   └── prompts/
│       ├── index.ts                # Prompt manager
│       └── examples/
│           └── sample-prompt.ts    # Sample prompt template
├── scripts/
│   ├── create-tool.ts              # Tool scaffolding generator
│   ├── test-stdio.ts               # End-to-end stdio protocol tester
│   └── export-schemas.ts           # Schema exporter to JSON files
├── templates/
│   └── mcp_config.example.json     # Client configuration snippets
├── tests/
│   ├── server.test.ts              # Server protocol tests
│   └── tools.test.ts               # Tool execution tests
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── Build.bat
├── Run-Tests.bat
├── Start-Server.bat
└── Install-Dependencies.bat
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
# or double click Install-Dependencies.bat
```

### 2. Build the Server
```bash
npm run build
# or double click Build.bat
```

### 3. Run Automated Tests
```bash
npm run test:all
# or double click Run-Tests.bat
```

### 4. Test Interactive CLI
```bash
# List all registered tools:
npm run cli list

# Call a tool directly:
npm run cli call echo '{"message": "Hello World!", "repeat": 2}'
```

---

## 🛠️ How to Create a New Tool in 3 Steps

### Step 1: Generate Scaffolding
```bash
npm run new-tool calculate_tax
```
This generates `src/tools/calculate-tax.tool.ts`.

### Step 2: Define Schema & Implement Logic
Open `src/tools/calculate-tax.tool.ts`:
```typescript
import { z } from 'zod';
import { BaseTool } from './base-tool';
import { MCPToolCallResult } from '../core/types';

export const CalculateTaxSchema = z.object({
  amount: z.number().positive().describe('Total amount in USD'),
  taxRate: z.number().min(0).max(1).default(0.09).describe('Tax rate decimal (e.g. 0.09 for 9%)'),
});

export type CalculateTaxInput = z.infer<typeof CalculateTaxSchema>;

export class CalculateTaxTool extends BaseTool<typeof CalculateTaxSchema> {
  public readonly name = 'calculate_tax';
  public readonly description = 'Calculates total tax and grand total for a given amount.';
  public readonly schema = CalculateTaxSchema;

  public async execute(args: CalculateTaxInput): Promise<MCPToolCallResult> {
    const tax = args.amount * args.taxRate;
    const total = args.amount + tax;

    return this.jsonResult({
      originalAmount: args.amount,
      taxRate: args.taxRate,
      taxAmount: Math.round(tax * 100) / 100,
      grandTotal: Math.round(total * 100) / 100,
    });
  }
}
```

### Step 3: Register in `src/tools/index.ts`
```typescript
import { CalculateTaxTool } from './calculate-tax.tool';

export function createDefaultToolRegistry(): ToolRegistry {
  const registry = new ToolRegistry();
  
  // Register your new tool:
  registry.register(new CalculateTaxTool());

  return registry;
}
```

Rebuild (`npm run build`) and test:
```bash
npm run cli call calculate_tax '{"amount": 100, "taxRate": 0.15}'
```

---

## 🔌 Connecting to AI Clients

### Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "my-mcp": {
      "command": "node",
      "args": ["C:/Users/ASUS/Desktop/flutter_project/base_mcp/bin/mcp-server.js"]
    }
  }
}
```

### Google Antigravity / Gemini CLI (`mcp_config.json`)
```json
{
  "mcpServers": {
    "my-mcp": {
      "command": "node",
      "args": ["C:/Users/ASUS/Desktop/flutter_project/base_mcp/bin/mcp-server.js"],
      "env": {
        "MCP_LOG_LEVEL": "info"
      }
    }
  }
}
```

### Cursor IDE (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "my-mcp": {
      "command": "node",
      "args": ["C:/Users/ASUS/Desktop/flutter_project/base_mcp/bin/mcp-server.js"]
    }
  }
}
```

---

## 📜 License
MIT License. Created by Antigravity Engineering.
