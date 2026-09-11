import { z } from 'zod';
import {
  MCPToolDefinition,
  MCPToolCallResult,
  MCPContentItem,
  ToolInputSchema,
} from '../core/types';
import { Logger } from '../core/logger';

export abstract class BaseTool<TSchema extends z.ZodObject<any> = z.ZodObject<any>> {
  /**
   * Unique name of the tool (e.g. "calculate_sum", "read_db_records")
   */
  public abstract readonly name: string;

  /**
   * Clear description for the AI Agent explaining what the tool does and when to use it
   */
  public abstract readonly description: string;

  /**
   * Zod schema defining arguments and validation rules
   */
  public abstract readonly schema: TSchema;

  /**
   * Execute the tool with validated arguments
   */
  public abstract execute(
    args: z.infer<TSchema>,
    context?: Record<string, unknown>
  ): Promise<MCPToolCallResult>;

  /**
   * Converts Zod Schema into JSON Schema required by MCP specification
   */
  public getDefinition(): MCPToolDefinition {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.convertZodToJsonSchema(this.schema),
    };
  }

  /**
   * Validates raw arguments against the schema and executes the tool
   */
  public async run(rawArgs: Record<string, unknown>, context?: Record<string, unknown>): Promise<MCPToolCallResult> {
    Logger.debug(`Executing tool '${this.name}'`, { args: rawArgs });
    try {
      const parsed = this.schema.safeParse(rawArgs || {});
      if (!parsed.success) {
        const errorMessages = parsed.error.issues
          .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
          .join(', ');
        Logger.warn(`Tool '${this.name}' parameter validation failed: ${errorMessages}`);
        return this.errorResult(`Invalid parameters for tool '${this.name}': ${errorMessages}`);
      }

      const result = await this.execute(parsed.data, context);
      return result;
    } catch (err: any) {
      Logger.error(`Tool '${this.name}' execution crashed: ${err.message}`, { stack: err.stack });
      return this.errorResult(`Tool execution failed: ${err.message}`);
    }
  }

  /**
   * Helper: Return successful text result
   */
  public textResult(text: string): MCPToolCallResult {
    return {
      content: [{ type: 'text', text }],
      isError: false,
    };
  }

  /**
   * Helper: Return successful formatted JSON object result
   */
  public jsonResult(data: unknown): MCPToolCallResult {
    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      isError: false,
    };
  }

  /**
   * Helper: Return error result
   */
  public errorResult(message: string): MCPToolCallResult {
    return {
      content: [{ type: 'text', text: message }],
      isError: true,
    };
  }

  /**
   * Helper: Return base64 image result
   */
  public imageResult(base64Data: string, mimeType: string = 'image/png'): MCPToolCallResult {
    return {
      content: [{ type: 'image', data: base64Data, mimeType }],
      isError: false,
    };
  }

  /**
   * Converts Zod Object to MCP JSON Schema format
   */
  private convertZodToJsonSchema(zodSchema: z.ZodObject<any>): ToolInputSchema {
    const shape = zodSchema.shape;
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const key of Object.keys(shape)) {
      const fieldDef = shape[key];
      const fieldSchema = this.convertZodTypeToJsonSchema(fieldDef);
      properties[key] = fieldSchema;

      if (!fieldDef.isOptional && !fieldDef.isNullable && !(fieldDef instanceof z.ZodDefault)) {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      ...(required.length > 0 ? { required } : {}),
      additionalProperties: false,
    };
  }

  private convertZodTypeToJsonSchema(zodType: any): Record<string, any> {
    let current = zodType;
    let description: string | undefined = undefined;

    // Unwrap description if present
    if (current.description) {
      description = current.description;
    }

    // Unwrap optional / nullable / default wrappers
    while (
      current instanceof z.ZodOptional ||
      current instanceof z.ZodNullable ||
      current instanceof z.ZodDefault
    ) {
      if (current instanceof z.ZodDefault) {
        current = current._def.innerType;
      } else {
        current = current.unwrap();
      }
      if (current.description && !description) {
        description = current.description;
      }
    }

    const base: Record<string, any> = {};
    if (description) {
      base.description = description;
    }

    if (current instanceof z.ZodString) {
      return { ...base, type: 'string' };
    }
    if (current instanceof z.ZodNumber) {
      return { ...base, type: 'number' };
    }
    if (current instanceof z.ZodBoolean) {
      return { ...base, type: 'boolean' };
    }
    if (current instanceof z.ZodArray) {
      return {
        ...base,
        type: 'array',
        items: this.convertZodTypeToJsonSchema(current.element),
      };
    }
    if (current instanceof z.ZodEnum) {
      return { ...base, type: 'string', enum: current._def.values };
    }
    if (current instanceof z.ZodObject) {
      return { ...base, ...this.convertZodToJsonSchema(current) };
    }
    if (current instanceof z.ZodRecord) {
      return { ...base, type: 'object' };
    }

    // Fallback generic object
    return { ...base, type: 'string' };
  }
}
