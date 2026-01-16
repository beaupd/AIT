# AIT Zed Extension

A Rust-based WebAssembly extension for Zed editor that integrates with the AIT daemon.

## Overview

The Zed extension provides the same functionality as the VS Code extension, but implemented in Rust and compiled to WebAssembly for Zed's extension system.

## Architecture

```
Zed Editor
    │
    ▼
Zed Extension (Rust/WASM)
    │
    ▼ (HTTP)
AIT Daemon (Node.js)
    │
    ├── Project Indexer
    ├── Context Router
    ├── Agent Executor
    └── Project Intelligence DB
```

The extension is a thin client that communicates with the AIT daemon via HTTP, following the same architecture as the VS Code extension.

## Features

- **Explain File**: `/ait:explain_file` - Explain the current file
- **Refactor Function**: `/ait:refactor_function <description>` - Refactor selected code
- **Debug Test**: `/ait:debug_test` - Analyze test failures
- **Summarize Standards**: `/ait:summarize_standards` - Show project conventions
- **Index Project**: `/ait:index_project` - Index the current project

## Building

### Prerequisites

1. Rust toolchain (install from https://rustup.rs/)
2. WASM target for Rust:
   ```bash
   rustup target add wasm32-wasi
   ```

### Build Commands

```bash
cd zed-extension

# Build using script
./build.sh

# Or using Make
make build

# Or manually
cargo build --release --target wasm32-wasi
```

## Installation

### Quick Install

```bash
cd zed-extension
make install
```

### Manual Installation

1. Build the extension (see above)
2. Copy files to Zed's extensions directory:
   ```bash
   mkdir -p ~/.local/share/zed/extensions/ait
   cp target/wasm32-wasi/release/*.wasm ~/.local/share/zed/extensions/ait/ait_zed_extension.wasm
   cp extension.toml ~/.local/share/zed/extensions/ait/
   ```
3. Restart Zed

### Using Zed CLI

```bash
zed extensions install --dev ./zed-extension
```

## Configuration

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

## Usage

1. Ensure AIT daemon is running:
   ```bash
   cd daemon
   npm start /path/to/project
   ```

2. In Zed, type `/` to open slash commands

3. Select an AIT command:
   - `ait:explain_file`
   - `ait:refactor_function`
   - `ait:debug_test`
   - `ait:summarize_standards`
   - `ait:index_project`

## Troubleshooting

### Extension Not Appearing

- Check installation: `ls ~/.local/share/zed/extensions/ait/`
- Check Zed logs: View → Command Palette → "Show Logs"
- Verify `extension.toml` is present

### Build Errors

- Ensure Rust is installed: `rustc --version`
- Install WASM target: `rustup target add wasm32-wasi`
- Check `Cargo.toml` dependencies

### Daemon Connection Errors

- Verify daemon is running: `curl http://localhost:3001/status`
- Check daemon port matches configuration
- Ensure firewall isn't blocking localhost

## Development

The extension uses:
- **Rust** for implementation
- **WebAssembly** as target (wasm32-wasi)
- **reqwest** for HTTP client
- **serde** for JSON serialization
- **zed_extension_api** for Zed integration

### Project Structure

```
zed-extension/
├── Cargo.toml          # Rust dependencies
├── extension.toml      # Extension manifest
├── src/
│   └── lib.rs          # Main extension code
├── build.sh            # Build script
├── Makefile           # Make targets
├── README.md          # Extension README
└── INSTALL.md         # Installation guide
```

## Differences from VS Code Extension

1. **Language**: Rust vs TypeScript
2. **Runtime**: WebAssembly vs Node.js
3. **API**: Zed extension API vs VS Code API
4. **Distribution**: WASM binary vs JavaScript bundle

Both extensions communicate with the same daemon and provide equivalent functionality.

## Future Enhancements

- Settings UI in Zed
- Better error messages
- Progress indicators
- Keyboard shortcuts
- Context menu integration
