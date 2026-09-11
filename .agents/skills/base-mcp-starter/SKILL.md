---
name: base-mcp-starter
description: Guide and architectural instructions for creating, extending, and adding tools to this Base MCP Server template.
---

# Base MCP Server Development Guide for AI Agents

This repository is a modular Base MCP Server template. Use this skill when asked to add new tools, resources, or prompts to this codebase.

## Project Structure Overview
- `src/tools/`: All MCP tools reside here.
  - `src/tools/base-tool.ts`: Base class `BaseTool<TSchema>` that automatically validates Zod inputs and converts them to MCP JSON Schema.
  - `src/tools/registry.ts`: `ToolRegistry` that handles tool lookup and execution.
  - `src/tools/index.ts`: Central registration where tools are instantiated.
- `src/resources/`: Dynamic MCP resources (`src/resources/index.ts`).
- `src/prompts/`: MCP prompts and workflows (`src/prompts/index.ts`).
- `src/core/`: JSON-RPC protocol implementation, stdio transport, and stderr logger.
- `bin/`: Entrypoints (`bin/mcp-server.js`, `bin/cli.ts`).
- `scripts/`: Development scripts (`npm run new-tool <name>`, `npm run test:stdio`, `npm run export-schemas`).

## Workflow to Add a New Tool
1. Create a new tool file in `src/tools/<tool-name>.tool.ts` extending `BaseTool`.
2. Define input schema using `z.object({...})` with descriptive `.describe()` annotations.
3. Implement `execute(args)` returning either `this.jsonResult(data)` or `this.textResult(string)`.
4. Register the new tool in `src/tools/index.ts` inside `createDefaultToolRegistry()`.
5. Run `npm run build` and `npm run test:all` to verify.

## Crucial MCP Principles
- **NEVER** log directly to `process.stdout` or use standard `console.log()` during server execution. Always use `Logger` from `src/core/logger.ts` which outputs to `process.stderr`.
- Return explicit typed responses. For errors, return `this.errorResult(message)` rather than unhandled promise rejections.
