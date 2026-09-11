#!/usr/bin/env node
/**
 * Zero-Config Autonomous MCP Server Launcher
 * 
 * Auto-Starts on demand with the first AI agent request:
 * 1. Checks dependencies (auto-installs if node_modules missing).
 * 2. Checks build artifacts (auto-builds if dist/index.js missing).
 * 3. Launches BaseMCPServer immediately on Stdio transport without user intervention.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distPath = path.resolve(rootDir, 'dist/index.js');
const nodeModulesPath = path.resolve(rootDir, 'node_modules');

function ensureReady() {
  // 1. Auto-install dependencies if missing
  if (!fs.existsSync(nodeModulesPath)) {
    process.stderr.write('[MCP Auto-Launcher] node_modules missing. Auto-installing dependencies...\n');
    try {
      execSync('npm install --prefer-offline --no-audit --no-fund', {
        cwd: rootDir,
        stdio: ['ignore', 'ignore', 'inherit'],
      });
      process.stderr.write('[MCP Auto-Launcher] Dependencies installed successfully.\n');
    } catch (installErr) {
      const msg = installErr instanceof Error ? installErr.message : String(installErr);
      process.stderr.write('[MCP Auto-Launcher] Failed to auto-install dependencies: ' + msg + '\n');
    }
  }

  // 2. Auto-build if dist is missing
  if (!fs.existsSync(distPath)) {
    process.stderr.write('[MCP Auto-Launcher] Build output missing. Auto-compiling TypeScript with Vite...\n');
    try {
      execSync('npm run build', {
        cwd: rootDir,
        stdio: ['ignore', 'ignore', 'inherit'],
      });
      process.stderr.write('[MCP Auto-Launcher] Build completed successfully.\n');
    } catch (buildErr) {
      const msg = buildErr instanceof Error ? buildErr.message : String(buildErr);
      process.stderr.write('[MCP Auto-Launcher] Auto-build failed: ' + msg + '\n');
    }
  }
}

async function bootstrap() {
  ensureReady();

  if (fs.existsSync(distPath)) {
    const distUrl = pathToFileURL(distPath).href;
    const { BaseMCPServer } = await import(distUrl);
    const server = new BaseMCPServer();
    await server.start();
  } else {
    // Fallback direct execution via tsx if installed
    try {
      const srcUrl = pathToFileURL(path.resolve(rootDir, 'src/server.js')).href;
      const { BaseMCPServer } = await import(srcUrl);
      const server = new BaseMCPServer();
      await server.start();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      process.stderr.write('[FATAL] Unable to start MCP server: ' + msg + '\n');
      process.exit(1);
    }
  }
}

bootstrap().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write('[FATAL] MCP Server bootstrap error: ' + msg + '\n');
  process.exit(1);
});
