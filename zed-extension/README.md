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

The build process automatically creates `extension.wasm` in the root directory, which is required for Zed's "Install Dev Extension" feature.

### Using the build script (recommended):

```bash
cd zed-extension
./build.sh
```

Or using Make:

```bash
cd zed-extension
make build
```

This will:
1. Build the extension for `wasm32-wasip2` target
2. Automatically copy the WASM file to `extension.wasm` in the root directory

### Manual build:

```bash
cd zed-extension
cargo build --release --target wasm32-wasip2
cp target/wasm32-wasip2/release/libait_zed_extension.wasm extension.wasm
```

## Installation

### Using "Install Dev Extension" in Zed (Recommended)

1. Build the extension (see above) - this creates `extension.wasm` in the root
2. In Zed, go to Extensions → "Install Dev Extension"
3. Select the `zed-extension` directory
4. Zed will automatically detect `extension.toml` and `extension.wasm`

### Using Make install

```bash
cd zed-extension
make install
```

This will copy the extension to `~/.local/share/zed/extensions/ait/` and you'll need to restart Zed.

### Using Zed CLI

```bash
cd zed-extension
zed extensions install --dev .
```

Make sure `extension.wasm` exists in the directory before running this command.

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

### Extension Not Detected by "Install Dev Extension"

If Zed doesn't detect your extension when using "Install Dev Extension":

1. **Verify `extension.wasm` exists:**
   ```bash
   ls -la zed-extension/extension.wasm
   ```
   If it doesn't exist, run `make build` or `./build.sh`

2. **Check `extension.toml` is in the root:**
   ```bash
   ls -la zed-extension/extension.toml
   ```

3. **Verify the directory structure:**
   ```
   zed-extension/
   ├── extension.toml    ✓ Required
   ├── extension.wasm    ✓ Required (created by build)
   ├── Cargo.toml
   └── src/
   ```

4. **Check Zed logs:**
   - In Zed: View → Command Palette → "Show Logs"
   - Look for extension loading errors

5. **Ensure you're selecting the correct directory:**
   - When clicking "Install Dev Extension", select the `zed-extension` folder itself
   - Not a parent directory or subdirectory
