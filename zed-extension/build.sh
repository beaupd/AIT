#!/bin/bash
set -e

echo "Building AIT Zed Extension..."

# 1. Check for Rust
if ! command -v cargo &> /dev/null; then
    echo "Error: Rust/Cargo is not installed"
    exit 1
fi

# 2. Update target to wasm32-wasip2 (Latest WASM target for Zed extensions)
if ! rustup target list --installed | grep -q "wasm32-wasip2"; then
    echo "Installing wasm32-wasip2 target..."
    rustup target add wasm32-wasip2
fi

# 3. Build using the correct target
echo "Building extension..."
cargo build --release --target wasm32-wasip2

# 4. Copy WASM file to extension root as extension.wasm (required for Zed's "Install Dev Extension")
echo "Copying WASM file to extension root..."
if [ -f target/wasm32-wasip2/release/libait_zed_extension.wasm ]; then
    cp target/wasm32-wasip2/release/libait_zed_extension.wasm extension.wasm
    echo "✓ Created extension.wasm"
elif [ -f target/wasm32-wasip2/release/ait_zed_extension.wasm ]; then
    cp target/wasm32-wasip2/release/ait_zed_extension.wasm extension.wasm
    echo "✓ Created extension.wasm"
else
    echo "Error: WASM file not found after build"
    echo "Expected location: target/wasm32-wasip2/release/libait_zed_extension.wasm"
    exit 1
fi

echo "Build complete!"
