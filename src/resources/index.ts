import {
  MCPResourceDefinition,
  MCPResourceContent,
} from '../core/types';
import { BaseResourceProvider, SampleConfigResource } from './examples/sample-resource';
import { MCPError } from '../core/errors';
import { Logger } from '../core/logger';

export class ResourceManager {
  private providers: Map<string, BaseResourceProvider> = new Map();

  public register(provider: BaseResourceProvider): this {
    this.providers.set(provider.definition.uri, provider);
    Logger.debug(`Registered MCP resource: ${provider.definition.uri}`);
    return this;
  }

  public listResources(): MCPResourceDefinition[] {
    return Array.from(this.providers.values()).map((p) => p.definition);
  }

  public async readResource(uri: string): Promise<MCPResourceContent> {
    const provider = this.providers.get(uri);
    if (!provider) {
      Logger.warn(`Resource not found: ${uri}`);
      throw MCPError.resourceNotFound(uri);
    }
    return await provider.read();
  }
}

export function createDefaultResourceManager(): ResourceManager {
  const manager = new ResourceManager();
  manager.register(new SampleConfigResource());
  return manager;
}
