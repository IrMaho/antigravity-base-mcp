#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function bootstrap() {
  const distPath = path.resolve(__dirname, '../dist/index.js');

  if (fs.existsSync(distPath)) {
    const { BaseMCPServer } = await import(distPath);
    const server = new BaseMCPServer();
    await server.start();
  } else {
    // If not yet built, attempt dynamic tsx import or inform user
    try {
      const { BaseMCPServer } = await import('../src/server.js');
      const server = new BaseMCPServer();
      await server.start();
    } catch (e) {
      process.stderr.write(
        '[ERROR] Dist build not found. Please run `npm run build` or `npm start` before launching.\n'
      );
      process.exit(1);
    }
  }
}

bootstrap().catch((err) => {
  process.stderr.write(`[FATAL] MCP Server bootstrap error: ${err.message}\n`);
  process.exit(1);
});
