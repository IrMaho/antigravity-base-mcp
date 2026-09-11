#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function toPascalCase(str: string): string {
  return str
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

const rawName = process.argv[2];

if (!rawName) {
  console.log(`
\x1b[33m[Usage]\x1b[0m npm run new-tool <tool_name>
Example: npm run new-tool fetch_weather
         npm run new-tool database_query
         npm run new-tool parse-csv
`);
  process.exit(1);
}

const kebabName = toKebabCase(rawName);
const snakeName = toSnakeCase(rawName);
const className = `${toPascalCase(rawName)}Tool`;
const schemaName = `${toPascalCase(rawName)}Schema`;
const inputTypeName = `${toPascalCase(rawName)}Input`;

const toolsDir = path.resolve(__dirname, '../src/tools');
const targetFile = path.join(toolsDir, `${kebabName}.tool.ts`);

if (fs.existsSync(targetFile)) {
  console.error(`\x1b[31m[Error]\x1b[0m Tool file already exists at: ${targetFile}`);
  process.exit(1);
}

const content = `import { z } from 'zod';
import { BaseTool } from './base-tool';
import { MCPToolCallResult } from '../core/types';

/**
 * 1. Define the input schema with Zod
 */
export const ${schemaName} = z.object({
  param1: z.string().describe('First parameter description'),
  param2: z.number().optional().default(1).describe('Optional numeric parameter'),
});

export type ${inputTypeName} = z.infer<typeof ${schemaName}>;

/**
 * 2. Implement the Tool Class
 */
export class ${className} extends BaseTool<typeof ${schemaName}> {
  public readonly name = '${snakeName}';
  public readonly description = 'Description of what ${snakeName} does and when the agent should use it.';
  public readonly schema = ${schemaName};

  public async execute(args: ${inputTypeName}): Promise<MCPToolCallResult> {
    try {
      // TODO: Implement your business logic here
      const resultData = {
        tool: this.name,
        receivedParam1: args.param1,
        receivedParam2: args.param2,
        timestamp: new Date().toISOString(),
      };

      return this.jsonResult(resultData);
    } catch (err: any) {
      return this.errorResult(\`Failed to execute \${this.name}: \${err.message}\`);
    }
  }
}
`;

fs.writeFileSync(targetFile, content, 'utf-8');
console.log(`\n\x1b[32m✔ Created new tool file:\x1b[0m ${targetFile}`);
console.log(`
\x1b[36mNext steps:\x1b[0m
1. Open \x1b[33msrc/tools/${kebabName}.tool.ts\x1b[0m and write your custom logic.
2. In \x1b[33msrc/tools/index.ts\x1b[0m:
   - Import: \x1b[32mimport { ${className} } from './${kebabName}.tool';\x1b[0m
   - Register: \x1b[32mregistry.register(new ${className}());\x1b[0m
3. Test it: \x1b[33mnpm run cli call ${snakeName} '{"param1":"hello"}'\x1b[0m
`);
