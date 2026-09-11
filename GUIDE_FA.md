# 📘 راهنمای جامع فارسی: ساخت و توسعه سرورهای MCP بر پایه‌ی Base MCP

این پروژه یک **قالب پایه استاندارد، مدولار و فوق‌العاده تمیز (Base MCP Starter Kit)** برای پروتکل **Model Context Protocol (MCP)** است که با **TypeScript**، **Zod**، **Vite** و **Vitest** پیاده‌سازی شده است.

هر زمان که خواستید برای یک کار جدید یا پروژه جدید، یک سرور MCP اختصاصی با ابزارهای دلخواه خود بسازید، کافی است این پوشه را کپی کرده و طبق مراحل زیر عمل کنید.

---

## 🧭 فهرست راهنما
1. [نحوه کپی و راه‌اندازی پروژه جدید](#۱-نحوه-کپی-و-راه‌اندازی-پروژه-جدید)
2. [ساختار و معماری پروژه](#۲-ساختار-و-معماری-پروژه)
3. [آموزش ساخت ابزار جدید (Tool) در ۳ مرحله](#۳-آموزش-ساخت-ابزار-جدید-tool-در-۳-مرحله)
4. [آموزش افزودن Resource و Prompt](#۴-آموزش-افزودن-resource-و-prompt)
5. [تست و عیب‌یابی سریع با CLI و تست‌های خودکار](#۵-تست-و-عیب‌یابی-سریع-با-cli-و-تست‌های-خودکار)
6. [نحوه اتصال به Claude Desktop، Antigravity، Cursor و VS Code](#۶-نحوه-اتصال-به-کلاینت‌های-هوش-مصنوعی)

---

## ۱. نحوه کپی و راه‌اندازی پروژه جدید

هنگامی که می‌خواهید یک MCP جدید بسازید:

### گام اول: کپی کردن پوشه
پوشه `base_mcp` را کپی کرده و به نام دلخواه پروژه جدید تغییر نام دهید (مثلاً `database_mcp` یا `flutter_analyzer_mcp`).

### گام دوم: تغییر نام در `package.json`
فایل `package.json` را باز کنید و نام پروژه را تغییر دهید:
```json
{
  "name": "my-new-mcp-server",
  "version": "1.0.0"
}
```

### گام سوم: نصب وابستگی‌ها
ترمینال را در پوشه باز کرده و دستور زیر را اجرا کنید (یا روی فایل `Install-Dependencies.bat` دابل کلیک کنید):
```bash
npm install
```

### گام چهارم: بیلد اولیه
```bash
npm run build
# یا دابل کلیک روی Build.bat
```

---

## ۲. ساختار و معماری پروژه

- 📂 `src/tools/`: **مهم‌ترین بخش برای شما!** تمام ابزارها (Tools) اینجا تعریف و ثبت می‌شوند.
  - `base-tool.ts`: کلاس پایه ابزارها به همراه تبدیل خودکار Zod به JSON-Schema.
  - `registry.ts`: رجیستری مرکزی ابزارها.
  - `index.ts`: فایل تجمیع و رجیستر کردن تمام ابزارها.
  - `examples/`: نمونه‌های آماده ابزارها (`echo`, `system-info`, `custom-template`).
- 📂 `src/resources/`: مدیریت منابع داده‌ای MCP (فایل‌ها، وضعیت سرور و...).
- 📂 `src/prompts/`: مدیریت پرامپت‌های از پیش آماده برای Agent.
- 📂 `src/core/`: موتور پروتکل JSON-RPC 2.0، ترنسپورت Stdio و لاگر امن بدون نویز روی stdout.
- 📂 `bin/`: فایل‌های اجرایی سرور و CLI.
- 📂 `scripts/`: اسکریپت‌های کاربردی (تولید خودکار ابزار، اکسپورت اسکیماها، تست کامل پروتکل).
- 📂 `tests/`: تست‌های خودکار واحد با Vitest.

---

## ۳. آموزش ساخت ابزار جدید (Tool) در ۳ مرحله

### روش اول: استفاده از ژنراتور خودکار (سریع‌ترین روش)
دستور زیر را در ترمینال اجرا کنید:
```bash
npm run new-tool calculate_discount
```
این دستور به‌طور خودکار فایل `src/tools/calculate-discount.tool.ts` را با اسکلت آماده، تایپ‌ها و ولیدیشن Zod می‌سازد.

---

### روش دوم: ساخت دستی فایل
یک فایل جدید در `src/tools/` مثلاً به نام `user-finder.tool.ts` بسازید:

```typescript
import { z } from 'zod';
import { BaseTool } from './base-tool';
import { MCPToolCallResult } from '../core/types';

// مرحله ۱: تعریف پارامترهای ورودی با Zod
export const UserFinderSchema = z.object({
  userId: z.string().min(1).describe('شناسه کاربری برای جستجو'),
  includeOrders: z.boolean().default(false).describe('آیا سفارشات کاربر هم بازگردانده شود؟'),
});

export type UserFinderInput = z.infer<typeof UserFinderSchema>;

// مرحله ۲: تعریف کلاس ابزار
export class UserFinderTool extends BaseTool<typeof UserFinderSchema> {
  public readonly name = 'find_user_by_id';
  public readonly description = 'جستجو و دریافت مشخصات کاربر بر اساس شناسه کاربری و گزارش سفارشات';
  public readonly schema = UserFinderSchema;

  // مرحله ۳: نوشتن منطق اجرایی
  public async execute(args: UserFinderInput): Promise<MCPToolCallResult> {
    try {
      // کد و لاجیک اختصاصی شما (ارتباط با دیتابیس، API، فایل و...)
      const userData = {
        id: args.userId,
        name: 'Ali Rezaei',
        role: 'Premium User',
        orders: args.includeOrders ? [{ orderId: 101, total: 50000 }] : undefined,
      };

      // خروجی جیسون با فرمت استاندارد MCP:
      return this.jsonResult(userData);

      // یا اگر خروجی متنی ساده می‌خواهید:
      // return this.textResult(`کاربر یافت شد: ${userData.name}`);
    } catch (err: any) {
      // در صورت وقوع خطا:
      return this.errorResult(`خطا در یافتن کاربر: ${err.message}`);
    }
  }
}
```

---

### مرحله نهایی: ثبت ابزار در `src/tools/index.ts`
فایل `src/tools/index.ts` را باز کرده و ابزار جدید را وارد و رجیستر کنید:

```typescript
import { UserFinderTool } from './user-finder.tool';

export function createDefaultToolRegistry(): ToolRegistry {
  const registry = new ToolRegistry();

  // ثبت ابزار جدید:
  registry.register(new UserFinderTool());

  return registry;
}
```

پروژه را بیلد کنید:
```bash
npm run build
```

---

## ۴. آموزش افزودن Resource و Prompt

### افزودن Resource (منبع داده):
فایل جدیدی در `src/resources/` بسازید:
```typescript
import { BaseResourceProvider } from './examples/sample-resource';
import { MCPResourceDefinition, MCPResourceContent } from '../core/types';

export class AppLogsResource implements BaseResourceProvider {
  public readonly definition: MCPResourceDefinition = {
    uri: 'file://logs/latest.log',
    name: 'Latest Application Logs',
    mimeType: 'text/plain',
  };

  public async read(): Promise<MCPResourceContent> {
    return {
      uri: this.definition.uri,
      mimeType: this.definition.mimeType,
      text: 'Log entry 1: Server started successfully...',
    };
  }
}
```
سپس آن را در `src/resources/index.ts` رجیستر کنید.

---

## ۵. تست و عیب‌یابی سریع با CLI و تست‌های خودکار

این پکیج ابزارهای فوق‌العاده‌ای برای تست بدون نیاز به راه‌اندازی دستی کلاینت هوش مصنوعی دارد:

### ۱. مشاهده تمام ابزارهای ثبت‌شده:
```bash
npm run cli list
```

### ۲. فراخوانی و تست یک ابزار به صورت زنده:
```bash
npm run cli call find_user_by_id '{"userId": "123", "includeOrders": true}'
```

### ۳. اجرای تمام تست‌های خودکار:
```bash
npm run test:all
# یا دابل کلیک روی Run-Tests.bat
```

### ۴. اکسپورت اسکیماها به فایل‌های JSON:
```bash
npm run export-schemas
```
این دستور تمام اسکیماهای ابزارها را در پوشه `schemas/` ذخیره می‌کند که برای IDEها و Agentها کاربرد دارد.

---

## ۶. نحوه اتصال به کلاینت‌های هوش مصنوعی

### ۱. اتصال به Claude Desktop
فایل پیکربندی کلود را در مسیر زیر باز کنید:
`%APPDATA%\Claude\claude_desktop_config.json`
و تنظیمات زیر را اضافه کنید:
```json
{
  "mcpServers": {
    "my-custom-mcp": {
      "command": "node",
      "args": ["C:/Users/ASUS/Desktop/flutter_project/base_mcp/bin/mcp-server.js"]
    }
  }
}
```

### ۲. اتصال به Google Antigravity / Gemini
در فایل `mcp_config.json`:
```json
{
  "mcpServers": {
    "my-custom-mcp": {
      "command": "node",
      "args": ["C:/Users/ASUS/Desktop/flutter_project/base_mcp/bin/mcp-server.js"],
      "env": {
        "MCP_LOG_LEVEL": "info"
      }
    }
  }
}
```

### ۳. اتصال به Cursor IDE
در فایل `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "my-custom-mcp": {
      "command": "node",
      "args": ["C:/Users/ASUS/Desktop/flutter_project/base_mcp/bin/mcp-server.js"]
    }
  }
}
```

---

## 💡 نکات طلایی و قوانین مهم MCP

1. **هیچ‌وقت از `console.log()` برای چاپ در stdout استفاده نکنید!**
   تمام لاگ‌ها باید با `Logger.info()`, `Logger.debug()`, `Logger.error()` ثبت شوند که خروجی را به صورت امن به `stderr` می‌فرستند تا پروتکل JSON-RPC مختل نشود.
2. **استفاده از Zod برای ولیدیشن دقیق:** همیشه برای ورودی‌های ابزارها از `.describe()` استفاده کنید تا هوش مصنوعی کاربرد دقیق هر فیلد را درک کند.
3. **همیشه بعد از تغییرات بیلد بگیرید:** دستور `npm run build` را اجرا کنید تا خروجی‌های تایپ اسکریپت در `dist/` به‌روز شوند.

**موفق و پیروز باشید! 🚀**
