# AIT Usage Guide

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Ollama installed and running
- Required Ollama models pulled

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Project

```bash
npm run build
```

### 4. Test the Setup

Run the test script to verify everything works:

```bash
./test.sh [project-path]
```

Or test manually:
```bash
# Check Ollama
curl http://localhost:11434/api/tags

# Start daemon
cd daemon
npm start /path/to/project

# In another terminal, test endpoints
curl http://localhost:3001/status
curl http://localhost:3001/db/stats
```

This builds all packages:
- `shared` - Shared types and protocol
- `daemon` - Local AI service
- `extension` - VS Code extension
- `cli` - Command-line interface

### 5. Set Up Ollama

```bash
# Start Ollama (if not already running)
ollama serve

# In another terminal, pull required models
ollama pull nomic-embed-text  # For embeddings
ollama pull llama3.2:3b       # For generation (or another 3B-7B model)
```

### 6. Start the Daemon

```bash
cd daemon
npm start /path/to/your/project
# Or with custom port:
PORT=3001 npm start /path/to/your/project
```

The daemon will:
- Create a database at `~/.ait/<project-hash>/intelligence.db`
- Start HTTP server on port 3001 (default)
- Be ready to accept requests

### 7. Index Your Project

Once the daemon is running, index your project:

**Using CLI:**
```bash
cd cli
npm run build  # If not already built
node dist/index.js index /path/to/your/project
```

**Using curl:**
```bash
curl -X POST http://localhost:3001/index \
  -H "Content-Type: application/json" \
  -d '{"project_path": "/path/to/your/project"}'
```

**Using VS Code Extension:**
- Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
- Run "AIT: Index project"

### 8. Query the Daemon

**Using CLI:**
```bash
# Explain a file
node dist/index.js query "Explain this file: src/index.ts" --file src/index.ts

# Refactor code
node dist/index.js query "Refactor this function to use async/await" --file src/utils.ts
```

**Using curl:**
```bash
curl -X POST http://localhost:3001/query \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Explain this file: src/index.ts",
    "context": {
      "task": "Explain this file: src/index.ts",
      "current_file": "src/index.ts"
    }
  }'
```

**Using VS Code Extension:**
- Right-click a file → "AIT: Explain this file"
- Select code → "AIT: Refactor this function"
- Open test file → "AIT: Why does this test fail?"
- Command Palette → "AIT: Summarize project conventions"

## VS Code Extension

### Installation

1. Build the extension:
   ```bash
   cd extension
   npm run build
   ```

2. Press `F5` in VS Code to launch Extension Development Host, or:
   ```bash
   npm run package
   # Install the generated .vsix file
   ```

### Configuration

Add to VS Code settings (`.vscode/settings.json` or User Settings):

```json
{
  "ait.daemonPort": 3001,
  "ait.ollamaUrl": "http://localhost:11434",
  "ait.embeddingModel": "nomic-embed-text",
  "ait.generationModel": "llama3.2:3b"
}
```

### Commands

- **AIT: Explain this file** - Explains the current file
- **AIT: Refactor this function** - Refactors selected code
- **AIT: Why does this test fail?** - Analyzes test failures
- **AIT: Summarize project conventions** - Shows project standards
- **AIT: Index project** - Indexes the current workspace

## CLI Commands

```bash
# Index a project
ait index <project-path> [--port <port>] [--files <files...>]

# Execute a query
ait query <task> [--port <port>] [--file <file>]

# Check daemon status
ait status [--port <port>]

# Database statistics
ait db:stats [--port <port>]
```

## API Endpoints

The daemon exposes a REST API:

- `GET /status` - Service status
- `GET /db/stats` - Database statistics
- `POST /index` - Index a project
  ```json
  {
    "project_path": "/path/to/project",
    "files": ["optional", "specific", "files"]
  }
  ```
- `POST /query` - Execute a task
  ```json
  {
    "task": "Task description",
    "context": {
      "task": "Task description",
      "current_file": "path/to/file",
      "files": ["file1", "file2"]
    }
  }
  ```

## Environment Variables

- `OLLAMA_BASE_URL` - Ollama API URL (default: `http://localhost:11434`)
- `OLLAMA_EMBEDDING_MODEL` - Embedding model name (default: `nomic-embed-text`)
- `OLLAMA_GENERATION_MODEL` - Generation model name (default: `llama3.2:3b`)
- `OLLAMA_TIMEOUT` - Request timeout in ms (default: `30000`)
- `PORT` - Daemon port (default: `3001`)

## Zed Extension

### Building

```bash
cd zed-extension
./build.sh
```

### Installation

```bash
# Development installation
zed extensions install --dev ./zed-extension

# Or manually copy to:
# ~/.local/share/zed/extensions/ait/
```

### Usage in Zed

Type `/` in Zed and select an AIT command:

- `/ait:explain_file` - Explain the current file
- `/ait:refactor_function <description>` - Refactor selected code
- `/ait:debug_test` - Analyze test failures
- `/ait:summarize_standards` - Show project standards
- `/ait:index_project` - Index the project

### Configuration

Configure in Zed settings (Settings → Extensions → ait):

```json
{
  "ait": {
    "daemon_port": 3001,
    "ollama_url": "http://localhost:11434",
    "embedding_model": "nomic-embed-text",
    "generation_model": "llama3.2:3b"
  }
}
```

## Troubleshooting

### Daemon won't start
- Check if Ollama is running: `ollama list`
- Verify models are pulled: `ollama list`
- Check port is available: `lsof -i :3001`

### Indexing fails
- Ensure project path is correct and accessible
- Check file permissions
- Verify Ollama is running and models are available

### Extension not working
- Check daemon is running: `ait status`
- Verify port matches configuration
- Check VS Code Developer Console for errors

### LLM errors
- Verify Ollama is running: `curl http://localhost:11434/api/tags`
- Check model names match pulled models: `ollama list`
- Ensure models are compatible (3B-7B for generation, embedding model for embeddings)

## Project Structure

```
AIT/
├── shared/          # Shared types and protocol
├── daemon/          # Local AI service daemon
├── extension/       # VS Code extension
├── cli/             # Command-line interface
└── package.json     # Root workspace config
```

## Database Location

The project intelligence database is stored at:
```
~/.ait/<project-hash>/intelligence.db
```

Where `<project-hash>` is a SHA256 hash of the project path.

## Next Steps

- Add more language parsers (Python, Go, Rust, etc.)
- Enhance semantic search with proper embedding similarity
- Implement diff application in extension
- Add more agent types for specific tasks
- Improve error handling and user feedback
