# Local Structured AI Coding Assistant

A **local-first, structured AI coding assistant** designed to work reliably with **small, open‑source LLMs** by eliminating guesswork, minimizing hallucinations, and enforcing explicit project understanding.

This project is **not a chat-based code generator**. It is a toolchain that builds and maintains a _project intelligence layer_ and uses LLMs as constrained, task‑specific functions.

---

## ✨ Core Idea

Large models compensate for lack of structure with scale. This project takes the opposite approach:

> **Structure + persistence + narrow objectives → reliable AI behavior**

Instead of giving a model your entire repository and hoping for the best, we:

- Maintain a local database that _understands_ the codebase
- Explicitly track files, symbols, relationships, and standards
- Route only the minimum necessary context to small LLMs
- Split work into deterministic, single‑purpose agents

The result is faster, cheaper, more predictable AI assistance that works locally.

---

## 🎯 Goals

- Work with **small (3B–7B) open‑source models**
- Reduce hallucinations by design, not by luck
- Persist project knowledge across sessions
- Be transparent, inspectable, and debuggable
- Integrate naturally into existing developer workflows

Initial target platform: **VS Code extension backed by a local service**.

---

## 🧠 High‑Level Architecture

```
VS Code Extension
       │
       ▼
Local AI Service (daemon)
       │
       ├── Project Indexer
       ├── Context Router
       ├── Agent Executor
       └── Project Intelligence DB (SQLite)
               ├── Relational metadata
               └── Vector embeddings
```

The editor provides UI and intent. The local service does the reasoning.

---

## 🗄️ Project Intelligence Database

The system is built around a **local SQLite database** that acts as the authoritative memory of the project.

### Why SQLite?

- Zero configuration
- Fast and local
- Easy to inspect and debug
- Sufficient for per‑project intelligence

### Dual Representation

The database stores information in two complementary forms:

1. **Structured relational data** (authoritative)
2. **Vector embeddings** (assistive, retrieval‑only)

Vectors are never trusted on their own. They only help locate relevant entities.

---

## 📁 Core Tables (Conceptual)

### `files`

Stores file‑level metadata.

- Path and language
- Role (core, test, config, etc.)
- Short factual summary
- Stability (stable / experimental)

### `symbols`

Tracks important code symbols.

- Functions, classes, constants
- Visibility and ownership
- Purpose summaries

### `relations`

Explicit relationships between files and symbols.

- Imports
- Calls
- Mirrors / parallels

### `standards`

Project‑specific rules and conventions.

- Naming
- Error handling
- Logging
- Architectural patterns

### `embeddings`

Vector representations of files, symbols, and standards for semantic lookup.

---

## 🔄 Indexing Pipeline

The indexer runs when:

- A project is opened
- Files are saved
- Manual reindexing is triggered

### Indexing Steps

1. Parse file structure
2. Extract symbols
3. Generate **short, factual summaries**
4. Store metadata in SQLite
5. Generate embeddings (optional but recommended)

LLMs used here are limited to summarization and classification — no code generation.

---

## 🤖 Agent‑Based Execution Model

There is **no general chat agent**.

All functionality is implemented as **task‑specific agents**, each with:

- A single responsibility
- Explicit inputs
- Explicit outputs
- Strict context limits

### Example Agents

| Agent            | Responsibility                    |
| ---------------- | --------------------------------- |
| File Finder      | Select relevant files             |
| Standards Loader | Retrieve applicable rules         |
| Change Planner   | Decide what should change         |
| Diff Generator   | Produce code diffs                |
| Validator        | Check correctness and consistency |

Agents do not explore the codebase. They operate only on provided context.

---

## 🧭 Context Routing

When a user issues a command (e.g. _“refactor this function”_):

1. Identify the task type
2. Select required agents
3. Query the database for:

   - Relevant files
   - Related symbols
   - Applicable standards

4. Assemble **minimal context**
5. Execute agents in sequence
6. Validate results before applying changes

No agent ever sees the entire repository.

---

## 🧩 VS Code Extension Role

The extension is intentionally thin. It:

- Captures user intent
- Displays explanations and diffs
- Applies changes safely
- Communicates with the local service

### Example Commands

- Explain this file
- Refactor this function safely
- Why does this test fail?
- Summarize project conventions

All intelligence lives outside the editor.

---

## 🧠 LLM Usage Philosophy

LLMs are treated as **pure functions**, not autonomous agents.

Rules:

- Small prompts
- Explicit instructions
- No hidden context
- No internal memory

All long‑term memory lives in the database.

---

## 🚫 Hallucination Mitigation (By Design)

Hallucinations are reduced by:

- Explicit context selection
- Persistent project knowledge
- Clear task boundaries
- Deterministic agent roles

If the system lacks sufficient information, it **refuses the task** instead of guessing.

---

## 🧪 Model Strategy

- Fully open‑source models
- Different models for different tasks
- Separate embedding and generation models

The system is **model‑agnostic**. Models are replaceable.

---

## 🧰 Interfaces

- **VS Code Extension** (primary)
- **Zed Extension** (Rust-based, WebAssembly)
- **CLI** for power users and automation
- Future: LSP‑style integration for other editors

---

## 🗺️ Roadmap

### Phase 1

- Local daemon
- SQLite project intelligence DB
- VS Code extension
- CLI interface

### Phase 2

- Team‑shared standards
- Policy enforcement
- Enterprise features
- Optional hosted inference

---

## 🔑 Guiding Principle

> **The system understands the project — not the model.**

The database is the product. The LLM is an interchangeable component.

---

## 📜 License & Philosophy

This project is designed to be:

- Open
- Local‑first
- Transparent
- Developer‑controlled

AI should behave like tooling, not magic.
