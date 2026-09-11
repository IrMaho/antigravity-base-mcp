import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createDefaultToolRegistry } from '../src/tools';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function exportSchemas() {
  const registry = createDefaultToolRegistry();
  const tools = registry.listTools();

  const outDir = path.resolve(__dirname, '../schemas');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Export full catalog
  const catalogPath = path.join(outDir, 'mcp-tools-catalog.json');
  fs.writeFileSync(catalogPath, JSON.stringify(tools, null, 2), 'utf-8');
  console.log(`\x1b[32m✔ Exported full tool catalog:\x1b[0m ${catalogPath}`);

  // Export individual tool schemas
  for (const tool of tools) {
    const filePath = path.join(outDir, `${tool.name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(tool, null, 2), 'utf-8');
  }
  console.log(`\x1b[32m✔ Exported ${tools.length} individual tool schemas to:\x1b[0m ${outDir}`);
}

exportSchemas();
