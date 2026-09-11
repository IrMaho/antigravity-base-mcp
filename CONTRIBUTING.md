# Contributing to Antigravity Base MCP Server

Thank you for your interest in contributing to the **Antigravity Base MCP Server Template**! We welcome contributions, bug fixes, feature requests, and new tool ideas.

---

## 🚀 Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/antigravity-base-mcp.git
   cd antigravity-base-mcp
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run build & tests**:
   ```bash
   npm run build
   npm run test:all
   ```

---

## 🛠️ Development Workflow

### Creating a New Tool
We provide an automated scaffolding script to generate standard tools:
```bash
npm run new-tool <tool_name>
```

### Protocol Guidelines
- **Zero Stdout Corruption**: Never use `console.log()` inside server logic. All logging must use `Logger` from `src/core/logger.ts` which routes output strictly to `process.stderr`.
- **Type Safety**: All input arguments must be declared with `Zod` schemas and include `.describe()` metadata for AI model readability.
- **Error Handling**: Return clean MCP errors using `this.errorResult(message)` rather than throwing unhandled rejections.

---

## 🧪 Testing

Make sure all tests pass before submitting a Pull Request:
```bash
# Run unit tests with Vitest
npm test

# Run full suite including real-stdio integration test
npm run test:all
```

---

## 📝 Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` A new feature or tool
- `fix:` A bug fix
- `docs:` Documentation updates
- `test:` Adding or updating tests
- `refactor:` Code improvements without functionality changes
- `chore:` Build scripts, dependencies, or configuration updates

Example:
```bash
git commit -m "feat(tools): add sqlite query tool with transaction support"
```

---

## 📬 Submitting a Pull Request

1. Create a feature branch (`git checkout -b feat/my-new-feature`).
2. Commit your changes following Conventional Commits.
3. Ensure all tests pass (`npm run test:all`).
4. Push to your branch (`git push origin feat/my-new-feature`).
5. Open a Pull Request against the `main` branch.
