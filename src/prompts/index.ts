import {
  MCPPromptDefinition,
  MCPPromptResult,
} from '../core/types';
import { BasePromptProvider, AnalyzeCodePrompt } from './examples/sample-prompt';
import { MCPError } from '../core/errors';
import { Logger } from '../core/logger';

export class PromptManager {
  private providers: Map<string, BasePromptProvider> = new Map();

  public register(provider: BasePromptProvider): this {
    this.providers.set(provider.definition.name, provider);
    Logger.debug(`Registered MCP prompt: ${provider.definition.name}`);
    return this;
  }

  public listPrompts(): MCPPromptDefinition[] {
    return Array.from(this.providers.values()).map((p) => p.definition);
  }

  public async getPrompt(name: string, args?: Record<string, string>): Promise<MCPPromptResult> {
    const provider = this.providers.get(name);
    if (!provider) {
      Logger.warn(`Prompt not found: ${name}`);
      throw MCPError.promptNotFound(name);
    }
    return await provider.get(args);
  }
}

export function createDefaultPromptManager(): PromptManager {
  const manager = new PromptManager();
  manager.register(new AnalyzeCodePrompt());
  return manager;
}
