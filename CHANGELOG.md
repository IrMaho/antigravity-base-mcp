# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-11

### Added
- **Core MCP Protocol**: Full compliance with Model Context Protocol (MCP) Specification (2024-11-05) and JSON-RPC 2.0.
- **Stdio Transport**: Clean Stdio transport engine with isolated stderr logging to prevent stdout stream corruption.
- **Abstract BaseTool**: Generic, typed tool foundation using Zod schemas with automatic JSON-Schema conversion.
- **Tool Registry**: Dynamic tool registration, lookup, validation, and execution engine.
- **Built-in Tools**:
  - `echo`: Echoes back user text with repetition and prefix support.
  - `get_system_info`: Inspects system OS, CPU architecture, platform, and memory diagnostics.
  - `my_custom_tool`: Copy-paste template tool for quick developer onboarding.
- **Dynamic Resources**: Sample URI-based dynamic resource provider (`config://server/status`).
- **Dynamic Prompts**: Sample prompt template manager with variable interpolation.
- **Autonomous Launcher**: Zero-config self-healing runner (`bin/mcp-server.js`) that auto-installs dependencies and builds on-demand.
- **Interactive Developer CLI**: Direct tool execution and inspection (`npm run cli`).
- **Scaffolding Generator**: Instant tool creation CLI (`npm run new-tool <name>`).
- **Schema Exporter**: Automatic tool JSON-Schema generator for AI IDE integration (`npm run export-schemas`).
- **Automated Client Registration**: 1-click registration for Antigravity IDE and Claude Desktop (`npm run register`).
- **Automated Test Suite**: Full Vitest unit test suite and real Stdio IPC integration testing suite.
- **Bilingual Documentation**: Complete English guide ([README.md](README.md)) and comprehensive Persian guide ([GUIDE_FA.md](GUIDE_FA.md)).
- **Windows Automation Scripts**: One-click `.bat` files for building, testing, installing, starting, and registering.
