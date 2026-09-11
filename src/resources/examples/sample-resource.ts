import { MCPResourceDefinition, MCPResourceContent } from '../../core/types';

export interface BaseResourceProvider {
  definition: MCPResourceDefinition;
  read(): Promise<MCPResourceContent>;
}

export class SampleConfigResource implements BaseResourceProvider {
  public readonly definition: MCPResourceDefinition = {
    uri: 'config://server/status',
    name: 'Server Status & Health',
    description: 'Current runtime configuration and server health status',
    mimeType: 'application/json',
  };

  public async read(): Promise<MCPResourceContent> {
    const data = {
      serverTime: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      status: 'operational',
      environment: process.env.NODE_ENV || 'development',
    };

    return {
      uri: this.definition.uri,
      mimeType: this.definition.mimeType,
      text: JSON.stringify(data, null, 2),
    };
  }
}
