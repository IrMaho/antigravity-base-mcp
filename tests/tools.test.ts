import { describe, it, expect } from 'vitest';
import { EchoTool } from '../src/tools/examples/echo.tool';
import { SystemInfoTool } from '../src/tools/examples/system-info.tool';
import { ToolRegistry } from '../src/tools/registry';

describe('Tool System & BaseTool', () => {
  it('EchoTool should validate inputs and repeat messages', async () => {
    const echo = new EchoTool();
    const result = await echo.run({ message: 'Hello', repeat: 3, prefix: '>>' });

    expect(result.isError).toBe(false);
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toBe('>> Hello\n>> Hello\n>> Hello');
  });

  it('EchoTool should fail gracefully on invalid input types', async () => {
    const echo = new EchoTool();
    const result = await echo.run({ message: 123 as any });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Invalid parameters');
  });

  it('SystemInfoTool should return valid JSON system information', async () => {
    const sys = new SystemInfoTool();
    const result = await sys.run({ includeMemory: true, includeCpu: true });

    expect(result.isError).toBe(false);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.platform).toBeDefined();
    expect(parsed.memory).toBeDefined();
    expect(parsed.cpu).toBeDefined();
  });

  it('ToolRegistry should register and execute tools properly', async () => {
    const registry = new ToolRegistry();
    const echo = new EchoTool();
    registry.register(echo);

    expect(registry.hasTool('echo')).toBe(true);
    expect(registry.size).toBe(1);

    const result = await registry.executeTool('echo', { message: 'Registry Test' });
    expect(result.isError).toBe(false);
    expect(result.content[0].text).toBe('Registry Test');
  });
});
