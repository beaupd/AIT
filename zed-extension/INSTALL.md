# Installing AIT Zed Extension

## Prerequisites

1. **Rust toolchain** - Install from https://rustup.rs/
2. **Zed editor** - Latest version
3. **AIT daemon** - Must be running (see main README)

## Quick Install

```bash
cd zed-extension
make install
```

This will:
1. Build the extension (WASM)
2. Copy it to Zed's extensions directory
3. Install the extension manifest

## Manual Installation

### 1. Build the Extension

```bash
cd zed-extension
cargo build --release --target wasm32-wasi
```

### 2. Install to Zed

```bash
# Create extension directory
mkdir -p ~/.local/share/zed/extensions/ait

# Copy WASM file (name may vary)
cp target/wasm32-wasi/release/ait_zed_extension.wasm ~/.local/share/zed/extensions/ait/ || \
cp target/wasm32-wasi/release/libait_zed_extension.wasm ~/.local/share/zed/extensions/ait/ait_zed_extension.wasm

# Copy manifest
cp extension.toml ~/.local/share/zed/extensions/ait/
```

### 3. Restart Zed

Close and reopen Zed to load the extension.

## Using Zed CLI (Alternative)

```bash
zed extensions install --dev ./zed-extension
```

## Verification

1. Open Zed
2. Type `/` in the editor
3. You should see AIT commands listed:
   - `ait:explain_file`
   - `ait:refactor_function`
   - `ait:debug_test`
   - `ait:summarize_standards`
   - `ait:index_project`

## Troubleshooting

### Extension Not Appearing

1. Check extension is installed:
   ```bash
   ls ~/.local/share/zed/extensions/ait/
   ```

2. Check Zed logs:
   - Open Zed
   - View → Command Palette → "Show Logs"
   - Look for extension loading errors

### Build Errors

1. Ensure Rust is installed:
   ```bash
   rustc --version
   cargo --version
   ```

2. Install WASM target:
   ```bash
   rustup target add wasm32-wasi
   ```

### Daemon Connection Errors

The extension requires the AIT daemon to be running:

```bash
cd daemon
npm start /path/to/project
```

Verify daemon is running:
```bash
curl http://localhost:3001/status
```

## Development

For development, you can use:

```bash
# Build
make build

# Clean build artifacts
make clean

# Install (rebuilds first)
make install
```

## Configuration

Configure the extension in Zed settings:

1. Open Zed Settings
2. Go to Extensions → ait
3. Configure:
   - `daemon_port` (default: 3001)
   - `ollama_url` (default: http://localhost:11434)
   - `embedding_model` (default: nomic-embed-text)
   - `generation_model` (default: llama3.2:3b)
