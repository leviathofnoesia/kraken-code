# Kraken Code

<div align="center">

![Version](https://img.shields.io/badge/v1.1.0-brightgreen?labelColor=0e8fd0&style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Runtime](https://img.shields.io/badge/runtime-Bun%20%7C%20Node.js-darkgreen?style=flat-square)
![Platform](https://img.shields.io/badge/platform-OpenCode-informational?style=flat-square)

**Transform OpenCode into an autonomous, high-density development environment**

[Documentation](#documentation) • [Quick Start](#quick-start) • [Examples](#examples) • [Changelog](CHANGELOG.md)

</div>

---

## 🦑 What is Kraken Code?

Kraken Code is a comprehensive plugin that supercharges [OpenCode](https://opencode.ai) with:

- **11 specialized AI agents** for every development phase
- **TDD enforcement** via Blitzkrieg mode
- **Persistent memory** across sessions with Kratos
- **Dynamic skills** for custom workflows
- **30+ hooks** for deep customization
- **MCP integrations** for web search, documentation, and GitHub
- **LSP tools** for code intelligence
- **CLI utilities** for project management

Think of it as giving OpenCode a second brain—one that remembers context, delegates intelligently, and enforces best practices automatically.

---

## ✨ Key Features

### 🧠 Specialized Agents
| Agent | Specialty |
|-------|-----------|
| **Kraken** | Architecture & orchestration |
| **Atlas** | Planning & task breakdown |
| **Nautilus** | Code exploration & search |
| **Abyssal** | Deep analysis & debugging |
| **Coral** | Building & construction |
| **Siren** | Documentation & communication |
| **Scylla** | Testing & validation |
| **Pearl** | Refactoring & optimization |
| **Poseidon** | Data & infrastructure |
| **Leviathan** | Large-scale refactoring |
| **Maelstrom** | First-principles reasoning |

### 🎯 Production Modes

- **Blitzkrieg** - Strict TDD enforcement with guardrails
- **Ultrawork** - Parallel agent execution for speed
- **Ultrathink** - Maximum reasoning with expanded context

### 💾 Persistent Memory

- **Kratos MCP** - Ultra-lean memory system
- Save decisions, patterns, and lessons
- Natural language queries
- Cross-session retention

### 🪝 Extensibility

- **Skills System** - Hot-reloadable workflow templates
- **30+ Hooks** - Context, coordination, error recovery
- **Commands** - Built-in and custom commands
- **MCP Protocol** - Extensible server integrations

### 🔍 Code Intelligence

- **12 LSP tools** for code analysis
- **16 language servers** supported
- AST-based search with ast-grep
- Context compression (70% token reduction)

---

## 🚀 Quick Start

### Installation

```bash
# Using Bun (recommended)
bun install kraken-code

# Using npm
npm install kraken-code
```

### Configuration

Add to your OpenCode config `~/.config/opencode/opencode.json`:

```json
{
  "plugin": ["kraken-code"]
}
```

That's it! Kraken Code auto-configures and integrates seamlessly.

### Initialize with Recommended Settings

```bash
# Full setup (all features)
kraken-code init --full

# Minimal setup (agents only)
kraken-code init --minimal
```

---

## 🎨 Usage Examples

### Using Specific Agents

```bash
# Planning
opencode run --agent Atlas "Plan a REST API for a todo app"

# Exploration
opencode run --agent Nautilus "Find all async functions without error handling"

# Debugging
opencode run --agent Abyssal "Investigate why memory usage increases over time"

# Testing
opencode run --agent Scylla "Write tests for the authentication module"
```

### Blitzkrieg TDD Mode

```bash
# Enable Blitzkrieg for strict test-driven development
opencode run "Enable Blitzkrieg mode"

# Now all tasks enforce TDD
opencode run "Implement user registration"
# → Blitzkrieg: "Please provide a test plan first..."
```

### Memory with Kratos

```bash
# Save a decision
opencode run "Save to Kratos: Decided to use PostgreSQL for better JSON support"

# Search past decisions
opencode run "Search Kratos for: what database did we choose and why?"

# Natural language queries
opencode run "Ask Kratos: what patterns have we used for error handling?"
```

### MCP Integrations

```bash
# Web search
opencode run "Use websearch to find best practices for React state management"

# Official docs
opencode run "Use Context7 to find TypeScript utility types"

# GitHub code search
opencode run "Use grep-app to find Express middleware examples"
```

---

## 🔧 CLI Commands

Kraken Code includes a powerful CLI for project management:

```bash
# Check installation status
kraken-code status

# Run system diagnostics
kraken-code doctor

# Check specific category
kraken-code doctor -c agents
kraken-code doctor -c blitzkrieg

# Verbose diagnostics
kraken-code doctor --verbose

# JSON output for automation
kraken-code doctor --json
```

---

## ⚙️ Configuration

### Agent Configuration

```json
{
  "kraken_code": {
    "agents": {
      "default": "Kraken",
      "enabled": ["Kraken", "Atlas", "Nautilus", "Abyssal", "Coral", "Siren", "Scylla", "Pearl", "Poseidon", "Leviathan", "Maelstrom"]
    }
  }
}
```

### Blitzkrieg Configuration

```json
{
  "kraken_code": {
    "blitzkrieg": {
      "enabled": true,
      "testPlanEnforcer": {
        "enabled": true,
        "requireTestPlan": true
      },
      "tddWorkflow": {
        "enabled": true,
        "enforceTestFirst": true
      },
      "evidenceVerifier": {
        "enabled": true,
        "requireTestResults": true
      }
    }
  }
}
```

### Kratos Memory Configuration

```json
{
  "kraken_code": {
    "kratos": {
      "enabled": true,
      "storagePath": "~/.kratos"
    }
  }
}
```

### Schema Autocomplete

Add to your config for IDE autocomplete:

```json
{
  "$schema": "https://raw.githubusercontent.com/leviathofnoesia/kraken-code/main/assets/kraken-code.schema.json"
}
```

---

## 🏗️ Architecture

### Core Components

- **Agent System** - 11 domain-specialized AI agents
- **Feature System** - Skills, commands, MCP, memory
- **Hook System** - 30+ hooks for customization
- **Tool System** - grep, ast-grep, compression, session management
- **Integrations** - GitHub SDK, Git SDK, LSP tools

### File Structure

```
src/
├── agents/          # Agent definitions and prompts
├── features/        # Skills, blitzkrieg, kratos, commands
├── hooks/           # Hook implementations
├── tools/           # Tool implementations
├── integrations/    # GitHub, Git, LSP, MCP
├── config/          # Schema and validation
└── cli/             # CLI commands
```

---

## 📊 Production Readiness

### Enterprise Features

- ✅ **TDD Enforcement** - Blitzkrieg ensures code quality
- ✅ **Persistent Memory** - Decisions survive across sessions
- ✅ **Audit Trail** - Session history and tracking
- ✅ **Customizable** - Skills, hooks, and configuration
- ✅ **Diagnostics** - Built-in health checks
- ✅ **Documentation** - Comprehensive guides and examples

### Performance

- **Context Pruning** - 70% token reduction with DCP engine
- **Hook Performance** - <50ms execution (p95)
- **Storage Efficiency** - JSONL for fast appends
- **LSP Integration** - Native tool support

### Reliability

- **Zod Validation** - Type-safe configuration
- **Error Recovery** - Multiple error recovery hooks
- **Session Persistence** - Continue where you left off
- **Auto-Update Checking** - Stay current with latest features

---

## 🧪 Testing & Quality

Run tests with:

```bash
bun test
```

Type checking:

```bash
bun run typecheck
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [FEATURES.md](FEATURES.md) | Complete feature overview |
| [EXAMPLES.md](EXAMPLES.md) | Practical usage examples |
| [FAQ.md](FAQ.md) | Common questions |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common issues and solutions |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |
| [CHANGELOG.md](CHANGELOG.md) | Version history |

### Architecture Documentation

- [Unified AI Memory Architecture](UNIFIED_AI_MEMORY_ARCHITECTURE.md) - Complete specification (600+ lines)
- [Implementation Status](IMPLEMENTATION_STATUS.md) - Development progress

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone the repo
git clone https://github.com/leviathofnoesia/kraken-code.git
cd kraken-code

# Install dependencies
bun install

# Build
bun run build

# Run tests
bun test
```

---

## 📈 Roadmap

### Upcoming Features

- [ ] **Unified AI Memory** - Full integration of 4-layer learning system (in progress)
  - Experience store with reinforcement learning
  - Knowledge graph for entity relationships
  - Pattern detection for wins/losses
  - State machine for behavioral control
  - FSRS scheduling for optimal review

- [ ] **Hierarchical State Machines** - Nested FSM support
- [ ] **Vector Embeddings** - Semantic similarity search
- [ ] **Advanced RL** - ε-greedy exploration, off-policy evaluation

See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for details.

---

## ❓ FAQ

<details>
<summary><b>How do I enable/disable specific agents?</b></summary>

Edit your OpenCode config:

```json
{
  "kraken_code": {
    "agents": {
      "enabled": ["Atlas", "Nautilus", "Scylla"]
    }
  }
}
```
</details>

<details>
<summary><b>Can I use Kraken Code with other OpenCode plugins?</b></summary>

Yes! Kraken Code is designed to work alongside other plugins. Configure multiple plugins in your `opencode.json`:

```json
{
  "plugin": ["kraken-code", "other-plugin"]
}
```
</details>

<details>
<summary><b>How do I create custom skills?</b></summary>

Create a directory with a `SKILL.md` file:

```bash
mkdir -p ~/.config/opencode/skill/my-workflow
```

Create `~/.config/opencode/skill/my-workflow/SKILL.md` with your instructions. Skills are automatically discovered and hot-reloaded.
</details>

<details>
<summary><b>Is the learning system (unified AI memory) available?</b></summary>

The unified AI memory system architecture is complete but **not yet integrated**. Core implementation exists (3,400+ lines) but requires hook integration and tool registration. See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for progress.
</details>

<details>
<summary><b>How do I troubleshoot issues?</b></summary>

Run diagnostics:

```bash
kraken-code doctor --verbose
```

Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common solutions.
</details>

---

## 🔗 Links

- **GitHub**: https://github.com/leviathofnoesia/kraken-code
- **Issues**: https://github.com/leviathofnoesia/kraken-code/issues
- **OpenCode**: https://opencode.ai
- **Discord**: https://discord.gg/clawd

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with 🦑 by [LeviathofNoesia](https://github.com/leviathofnoesia)**

[⬆ Back to top](#kraken-code)

</div>
