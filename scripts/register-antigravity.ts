import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { createDefaultToolRegistry } from '../src/tools/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const serverName = packageJson.name || 'custom-mcp-server';
const serverDescription = packageJson.description || 'Custom MCP Server for AI Agent Tools';

const serverScript = path.resolve(rootDir, 'bin/mcp-server.js').replace(/\\/g, '/');

// Get all tool names
const registry = createDefaultToolRegistry();
const allToolNames = registry.listTools().map((t) => t.name);

console.log('\n=== Registering MCP Server to AI Clients ===');
console.log(`Server Name: ${serverName}`);
console.log(`Executable Path: ${serverScript}`);
console.log(`Registered Tools (${allToolNames.length}): ${allToolNames.join(', ')}\n`);

const homeDir = os.homedir();
let registeredCount = 0;

// 1. Google Antigravity Global Config
const antigravityConfigPath = path.join(homeDir, '.gemini/config/mcp_config.json');
try {
  const dir = path.dirname(antigravityConfigPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let config: any = { mcpServers: {} };
  if (fs.existsSync(antigravityConfigPath)) {
    try {
      config = JSON.parse(fs.readFileSync(antigravityConfigPath, 'utf-8'));
    } catch {}
  }

  config.mcpServers = config.mcpServers || {};
  config.mcpServers[serverName] = {
    command: 'node',
    args: [serverScript],
    disabled: false,
    description: serverDescription,
    alwaysAllow: allToolNames,
  };

  fs.writeFileSync(antigravityConfigPath, JSON.stringify(config, null, 2), 'utf-8');
  console.log(`✔ [Antigravity IDE] Successfully registered in: ${antigravityConfigPath}`);
  registeredCount++;
} catch (err: any) {
  console.error(`✖ [Antigravity IDE] Failed: ${err.message}`);
}

// 2. Claude Desktop Config (AppData)
const claudeConfigPath = path.join(
  process.env.APPDATA || path.join(homeDir, 'AppData/Roaming'),
  'Claude/claude_desktop_config.json'
);
try {
  const dir = path.dirname(claudeConfigPath);
  if (fs.existsSync(dir)) {
    let claudeConfig: any = { mcpServers: {} };
    if (fs.existsSync(claudeConfigPath)) {
      try {
        claudeConfig = JSON.parse(fs.readFileSync(claudeConfigPath, 'utf-8'));
      } catch {}
    }

    claudeConfig.mcpServers = claudeConfig.mcpServers || {};
    claudeConfig.mcpServers[serverName] = {
      command: 'node',
      args: [serverScript],
    };

    fs.writeFileSync(claudeConfigPath, JSON.stringify(claudeConfig, null, 2), 'utf-8');
    console.log(`✔ [Claude Desktop] Successfully registered in: ${claudeConfigPath}`);
    registeredCount++;
  }
} catch (err: any) {
  // Silent
}

// 3. Cursor Global Config
const cursorConfigPath = path.join(homeDir, '.cursor/mcp.json');
try {
  const dir = path.dirname(cursorConfigPath);
  if (fs.existsSync(dir)) {
    let cursorConfig: any = { mcpServers: {} };
    if (fs.existsSync(cursorConfigPath)) {
      try {
        cursorConfig = JSON.parse(fs.readFileSync(cursorConfigPath, 'utf-8'));
      } catch {}
    }

    cursorConfig.mcpServers = cursorConfig.mcpServers || {};
    cursorConfig.mcpServers[serverName] = {
      command: 'node',
      args: [serverScript],
    };

    fs.writeFileSync(cursorConfigPath, JSON.stringify(cursorConfig, null, 2), 'utf-8');
    console.log(`✔ [Cursor IDE] Successfully registered in: ${cursorConfigPath}`);
    registeredCount++;
  }
} catch (err: any) {
  // Silent
}

console.log('\n====================================================');
console.log('🎉 Registration Complete! Server is now active in Antigravity.');
console.log('Tip: Open Antigravity -> "Manage MCP servers" -> Click "Refresh" (top right)');
console.log('====================================================\n');
