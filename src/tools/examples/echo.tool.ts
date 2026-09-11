import { z } from 'zod';
import { BaseTool } from '../base-tool';
import { MCPToolCallResult } from '../../core/types';

const EchoSchema = z.object({
  message: z.string().describe('The text message to echo back'),
  repeat: z.number().int().min(1).max(10).default(1).describe('Number of times to repeat the message'),
  prefix: z.string().optional().describe('Optional prefix to prepend to each line'),
});

type EchoInput = z.infer<typeof EchoSchema>;

export class EchoTool extends BaseTool<typeof EchoSchema> {
  public readonly name = 'echo';
  public readonly description = 'Echoes back the input message with optional repetition and prefix formatting.';
  public readonly schema = EchoSchema;

  public async execute(args: EchoInput): Promise<MCPToolCallResult> {
    const lines: string[] = [];
    const pfx = args.prefix ? `${args.prefix} ` : '';

    for (let i = 0; i < args.repeat; i++) {
      lines.push(`${pfx}${args.message}`);
    }

    return this.textResult(lines.join('\n'));
  }
}
