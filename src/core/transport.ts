import readline from 'readline';
import { JSONRPCRequest, JSONRPCResponse } from './types';
import { Logger } from './logger';
import { MCPError } from './errors';

export type RequestHandler = (request: JSONRPCRequest) => Promise<JSONRPCResponse | null>;

export interface Transport {
  start(handler: RequestHandler): Promise<void>;
  send(response: JSONRPCResponse): void;
  close(): Promise<void>;
}

export class StdioTransport implements Transport {
  private rl: readline.Interface | null = null;
  private handler: RequestHandler | null = null;

  public async start(handler: RequestHandler): Promise<void> {
    this.handler = handler;

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    Logger.info('Stdio transport started and listening on stdin');

    this.rl.on('line', async (line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      Logger.debug(`[INBOUND] ${trimmed}`);

      try {
        let request: JSONRPCRequest;
        try {
          request = JSON.parse(trimmed);
        } catch (parseErr: any) {
          Logger.error(`JSON parse error on input line: ${parseErr.message}`);
          const errResp: JSONRPCResponse = {
            jsonrpc: '2.0',
            id: null,
            error: MCPError.parseError(`Invalid JSON: ${parseErr.message}`).toJSONRPCError(),
          };
          this.send(errResp);
          return;
        }

        if (this.handler) {
          const response = await this.handler(request);
          if (response) {
            this.send(response);
          }
        }
      } catch (fatalErr: any) {
        Logger.error(`Fatal transport handler error: ${fatalErr.message}`, { stack: fatalErr.stack });
      }
    });

    this.rl.on('close', () => {
      Logger.info('Stdio transport input stream closed');
    });
  }

  public send(response: JSONRPCResponse): void {
    const payload = JSON.stringify(response);
    Logger.debug(`[OUTBOUND] ${payload}`);
    // MCP requirement: write single-line JSON followed by newline to stdout
    process.stdout.write(payload + '\n');
  }

  public async close(): Promise<void> {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }
}
