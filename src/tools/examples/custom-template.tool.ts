/**
 * ============================================================================
 * MCP TOOL TEMPLATE / الگوی ساخت ابزار جدید برای
 * ============================================================================
 * 
 * Instructions to create a new tool:
 * 1. Copy this file and rename it (e.g. `src/tools/my-new-tool.ts`).
 * 2. Define your input parameters using Zod in `MyCustomToolSchema`.
 * 3. Set `name` and `description` in your class.
 * 4. Write your business logic inside the `execute` method.
 * 5. Register your tool in `src/tools/index.ts`.
 * 
 * راهنمای ساخت ابزار جدید:
 * ۱. این فایل را کپی کرده و تغییر نام دهید (مثلاً `src/tools/my-new-tool.ts`)
 * ۲. فیلدهای ورودی را با Zod در `MyCustomToolSchema` مشخص کنید.
 * ۳. نام (`name`) و توضیحات (`description`) را وارد کنید.
 * ۴. منطق ابزار را داخل تابع `execute` بنویسید.
 * ۵. ابزار را در `src/tools/index.ts` رجیستر کنید.
 */

import { z } from 'zod';
import { BaseTool } from '../base-tool';
import { MCPToolCallResult } from '../../core/types';

// 1. Define Input Schema with Zod
export const MyCustomToolSchema = z.object({
  query: z
    .string()
    .describe('Search query or target input string'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .describe('Maximum number of items to return'),
  options: z
    .object({
      detailed: z.boolean().default(false).describe('Include verbose output'),
    })
    .optional()
    .describe('Optional execution configuration'),
});

export type MyCustomToolInput = z.infer<typeof MyCustomToolSchema>;

// 2. Define the Tool Class
export class MyCustomTool extends BaseTool<typeof MyCustomToolSchema> {
  // Unique tool name (used by AI agent to call this tool)
  public readonly name = 'my_custom_tool';

  // Clear explanation of what this tool does for LLMs
  public readonly description =
    'Detailed description of what this tool accomplishes, its expected input, and its output format.';

  // Schema reference
  public readonly schema = MyCustomToolSchema;

  // 3. Execution logic
  public async execute(args: MyCustomToolInput): Promise<MCPToolCallResult> {
    try {
      // --- Your Custom Logic Goes Here ---
      const resultData = {
        status: 'success',
        processedQuery: args.query,
        limitApplied: args.limit,
        isDetailed: args.options?.detailed ?? false,
        timestamp: new Date().toISOString(),
      };

      // Return JSON data or formatted text:
      return this.jsonResult(resultData);

      // Or return plain text:
      // return this.textResult(`Successfully processed: ${args.query}`);
    } catch (err: any) {
      // Return a clean error if something goes wrong:
      return this.errorResult(`Failed to execute my_custom_tool: ${err.message}`);
    }
  }
}
