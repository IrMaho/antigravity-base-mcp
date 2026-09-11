import os from 'os';
import { z } from 'zod';
import { BaseTool } from '../base-tool';
import { MCPToolCallResult } from '../../core/types';

const SystemInfoSchema = z.object({
  includeMemory: z.boolean().default(true).describe('Whether to include memory statistics'),
  includeCpu: z.boolean().default(true).describe('Whether to include CPU architecture details'),
});

type SystemInfoInput = z.infer<typeof SystemInfoSchema>;

export class SystemInfoTool extends BaseTool<typeof SystemInfoSchema> {
  public readonly name = 'get_system_info';
  public readonly description = 'Retrieves current system diagnostics including OS, Node version, memory, and CPU info.';
  public readonly schema = SystemInfoSchema;

  public async execute(args: SystemInfoInput): Promise<MCPToolCallResult> {
    const info: Record<string, unknown> = {
      platform: os.platform(),
      release: os.release(),
      type: os.type(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(os.uptime()),
    };

    if (args.includeMemory) {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      info.memory = {
        totalMB: Math.round(totalMem / (1024 * 1024)),
        freeMB: Math.round(freeMem / (1024 * 1024)),
        usedMB: Math.round((totalMem - freeMem) / (1024 * 1024)),
      };
    }

    if (args.includeCpu) {
      const cpus = os.cpus();
      info.cpu = {
        model: cpus[0]?.model || 'Unknown',
        cores: cpus.length,
        speedMHz: cpus[0]?.speed || 0,
      };
    }

    return this.jsonResult(info);
  }
}
