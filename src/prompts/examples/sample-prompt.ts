import {
  MCPPromptDefinition,
  MCPPromptResult,
} from '../../core/types';

export interface BasePromptProvider {
  definition: MCPPromptDefinition;
  get(args?: Record<string, string>): Promise<MCPPromptResult>;
}

export class AnalyzeCodePrompt implements BasePromptProvider {
  public readonly definition: MCPPromptDefinition = {
    name: 'analyze_code_snippet',
    description: 'Generates a structured prompt to perform deep code analysis, security audit, and refactoring',
    arguments: [
      {
        name: 'language',
        description: 'Programming language of the code',
        required: true,
      },
      {
        name: 'code',
        description: 'Source code snippet to analyze',
        required: true,
      },
      {
        name: 'focusArea',
        description: 'Specific focus: performance, security, architecture, or clean code',
        required: false,
      },
    ],
  };

  public async get(args?: Record<string, string>): Promise<MCPPromptResult> {
    const lang = args?.language || 'typescript';
    const code = args?.code || '// No code provided';
    const focus = args?.focusArea || 'general quality and security';

    return {
      description: `Perform detailed code analysis focusing on ${focus}`,
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please review the following ${lang} code with a focus on ${focus}:\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\nProvide concrete recommendations, potential bugs, edge cases, and refactored code snippets.`,
          },
        },
      ],
    };
  }
}
