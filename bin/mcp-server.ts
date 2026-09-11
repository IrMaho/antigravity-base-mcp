#!/usr/bin/env node
import { BaseMCPServer } from '../src/server';

const server = new BaseMCPServer();
server.start().catch((err) => {
  process.stderr.write(`[FATAL] Failed to start MCP Server: ${err.message}\n`);
  process.exit(1);
});
