import { spawn } from 'child_process';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testStdioMCP() {
  console.log('\x1b[36m=== Testing MCP Server over STDIO Transport ===\x1b[0m\n');

  const rootDir = path.resolve(__dirname, '..');
  const serverProc = spawn('npx', ['tsx', 'bin/mcp-server.ts'], {
    cwd: rootDir,
    stdio: ['pipe', 'pipe', 'inherit'],
    shell: true,
  });

  const rl = readline.createInterface({
    input: serverProc.stdout,
  });

  const pendingRequests = new Map<number, (res: any) => void>();

  rl.on('line', (line) => {
    try {
      const json = JSON.parse(line);
      if (json.id !== undefined && json.id !== null) {
        const resolve = pendingRequests.get(json.id);
        if (resolve) {
          pendingRequests.delete(json.id);
          resolve(json);
        }
      }
    } catch (e: any) {
      console.error('Failed to parse stdout line:', line);
    }
  });

  let nextId = 1;
  function sendRPC(method: string, params?: Record<string, unknown>): Promise<any> {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pendingRequests.delete(id);
        reject(new Error(`Timeout waiting for response to ${method} (id=${id})`));
      }, 5000);

      pendingRequests.set(id, (res) => {
        clearTimeout(timer);
        resolve(res);
      });

      const message = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
      serverProc.stdin.write(message);
    });
  }

  function sendNotification(method: string, params?: Record<string, unknown>): void {
    const message = JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n';
    serverProc.stdin.write(message);
  }

  // 1. Initialize
  console.log('1. Testing initialize...');
  const initRes = await sendRPC('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test-runner', version: '1.0.0' },
  });
  if (!initRes.result || !initRes.result.serverInfo) {
    throw new Error('Invalid initialize response: ' + JSON.stringify(initRes));
  }
  console.log(`   \x1b[32m✔ Server:\x1b[0m ${initRes.result.serverInfo.name} v${initRes.result.serverInfo.version}`);

  // 2. Initialized Notification
  console.log('2. Sending initialized notification...');
  sendNotification('notifications/initialized', {});
  console.log('   \x1b[32m✔ Sent\x1b[0m');

  // 3. Ping
  console.log('3. Testing ping...');
  const pingRes = await sendRPC('ping', {});
  if (pingRes.error) throw new Error('Ping failed');
  console.log('   \x1b[32m✔ Ping OK\x1b[0m');

  // 4. Tools List
  console.log('4. Testing tools/list...');
  const toolsRes = await sendRPC('tools/list', {});
  const tools = toolsRes.result.tools;
  console.log(`   \x1b[32m✔ Tools returned:\x1b[0m ${tools.length} tools registered.`);
  tools.forEach((t: any) => console.log(`     - ${t.name}: ${t.description.substring(0, 50)}...`));

  // 5. Tool Call: echo
  console.log('5. Testing tools/call (echo)...');
  const echoRes = await sendRPC('tools/call', {
    name: 'echo',
    arguments: { message: 'Hello MCP!', repeat: 2, prefix: '>>>' },
  });
  if (echoRes.result.isError) throw new Error('Echo call returned error');
  console.log('   \x1b[32m✔ Echo output:\x1b[0m\n' + echoRes.result.content[0].text);

  // 6. Tool Call: get_system_info
  console.log('6. Testing tools/call (get_system_info)...');
  const sysRes = await sendRPC('tools/call', {
    name: 'get_system_info',
    arguments: { includeMemory: true, includeCpu: false },
  });
  if (sysRes.result.isError) throw new Error('System info call returned error');
  console.log('   \x1b[32m✔ System Info output received successfully\x1b[0m');

  // 7. Resources List & Read
  console.log('7. Testing resources/list & resources/read...');
  const resList = await sendRPC('resources/list', {});
  console.log(`   \x1b[32m✔ Resources returned:\x1b[0m ${resList.result.resources.length}`);
  if (resList.result.resources.length > 0) {
    const firstUri = resList.result.resources[0].uri;
    const readRes = await sendRPC('resources/read', { uri: firstUri });
    console.log(`   \x1b[32m✔ Read resource:\x1b[0m ${firstUri}`);
  }

  // 8. Prompts List & Get
  console.log('8. Testing prompts/list & prompts/get...');
  const promptList = await sendRPC('prompts/list', {});
  console.log(`   \x1b[32m✔ Prompts returned:\x1b[0m ${promptList.result.prompts.length}`);
  if (promptList.result.prompts.length > 0) {
    const firstPrompt = promptList.result.prompts[0].name;
    const getPrompt = await sendRPC('prompts/get', {
      name: firstPrompt,
      arguments: { language: 'typescript', code: 'const x = 10;' },
    });
    console.log(`   \x1b[32m✔ Prompt generated:\x1b[0m ${getPrompt.result.description}`);
  }

  serverProc.kill();
  console.log('\n\x1b[32m====================================================\x1b[0m');
  console.log('\x1b[32m🎉 ALL MCP PROTOCOL & TOOL TESTS PASSED PERFECTLY!\x1b[0m');
  console.log('\x1b[32m====================================================\x1b[0m\n');
  process.exit(0);
}

testStdioMCP().catch((err) => {
  console.error('\x1b[31m[TEST FAILED]\x1b[0m', err);
  process.exit(1);
});
