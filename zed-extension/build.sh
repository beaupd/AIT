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

echo "Build complete!"
