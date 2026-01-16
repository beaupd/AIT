# AIT Zed Extension

Zed editor extension for AIT (Local Structured AI Coding Assistant).

## Features

- **Explain File**: Explain the current file using AIT
- **Refactor Function**: Refactor selected code with AI assistance
- **Debug Test**: Analyze why tests fail
- **Summarize Standards**: Show project conventions and standards
- **Index Project**: Index the current project for AI assistance

## Prerequisites

1. AIT daemon must be running (see main README)
2. Ollama must be running locally or remotely
3. Rust toolchain installed

## Building

```bash
cd zed-extension
cargo build --release --target wasm32-wasi
```

## Installation

### Development Installation

1. Build the extension (see above)
2. Copy the built WASM file to Zed's extensions directory:
   ```bash
   cp target/wasm32-wasi/release/ait_zed_extension.wasm ~/.local/share/zed/extensions/ait/
   cp extension.toml ~/.local/share/zed/extensions/ait/
   ```

3. Restart Zed

### Using Zed CLI

```bash
zed extensions install --dev ./zed-extension
```

## Configuration

Configure the extension in Zed settings:

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

## Usage

### Slash Commands

Type `/` in Zed and select an AIT command:

- `/ait:explain_file` - Explain the current file
- `/ait:refactor_function <description>` - Refactor selected code
- `/ait:debug_test` - Analyze test failures
- `/ait:summarize_standards` - Show project standards
- `/ait:index_project` - Index the project

## Architecture

This extension is a thin client that communicates with the AIT daemon via HTTP. All intelligence lives in the daemon, following the project's architecture principles.

## Troubleshooting

### Daemon Not Running

If you see "daemon is not running" errors:

1. Start the daemon:
   ```bash
   cd daemon
   npm start /path/to/project
   ```

2. Verify it's running:
   ```bash
   curl http://localhost:3001/status
   ```

### Connection Issues

- Check daemon port matches configuration (default: 3001)
- Verify firewall isn't blocking localhost connections
- Check daemon logs for errors
