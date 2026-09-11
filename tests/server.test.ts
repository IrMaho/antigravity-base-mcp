import { describe, it, expect, beforeEach } from 'vitest';
import { BaseMCPServer } from '../src/server';
import { JSONRPCRequest } from '../src/core/types';

describe('BaseMCPServer Protocol Engine', () => {
  let server: BaseMCPServer;

  beforeEach(() => {
    server = new BaseMCPServer({
      config: {
        info: { name: 'test-mcp', version: '1.0.0' },
      },
    });
  });

  it('should handle initialize request correctly', async () => {
    const req: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' },
      },
    };

    const res = await server.handleRequest(req);
    expect(res).toBeDefined();
    expect(res?.jsonrpc).toBe('2.0');
    expect(res?.id).toBe(1);
    expect((res?.result as any)?.serverInfo?.name).toBe('test-mcp');
    expect((res?.result as any)?.protocolVersion).toBe('2024-11-05');
  });

  it('should return null for notifications', async () => {
    const req: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: null,
      method: 'notifications/initialized',
    };

    const res = await server.handleRequest(req);
    expect(res).toBeNull();
  });

  it('should return registered tools on tools/list', async () => {
    const req: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
    };

    const res = await server.handleRequest(req);
    expect(res?.result).toBeDefined();
    const tools = (res?.result as any).tools;
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBeGreaterThan(0);
    const names = tools.map((t: any) => t.name);
    expect(names).toContain('echo');
    expect(names).toContain('get_system_info');
  });

  it('should execute tool on tools/call', async () => {
    const req: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'echo',
        arguments: { message: 'Unit Test Echo', repeat: 1 },
      },
    };

    const res = await server.handleRequest(req);
    expect(res?.result).toBeDefined();
    const result = res?.result as any;
    expect(result.isError).toBe(false);
    expect(result.content[0].text).toBe('Unit Test Echo');
  });

  it('should return error on invalid tool name', async () => {
    const req: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'non_existent_tool_123',
        arguments: {},
      },
    };

    const res = await server.handleRequest(req);
    const result = res?.result as any;
    expect(result.isError).toBe(true);
  });

  it('should return method not found for unknown methods', async () => {
    const req: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: 5,
      method: 'unknown/method',
    };

    const res = await server.handleRequest(req);
    expect(res?.error).toBeDefined();
    expect(res?.error?.code).toBe(-32601);
  });
});
