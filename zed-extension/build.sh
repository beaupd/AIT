#!/bin/bash
set -e

echo "Building AIT Zed Extension..."

# 1. Check for Rust
if ! command -v cargo &> /dev/null; then
    echo "Error: Rust/Cargo is not installed"
    exit 1
fi

# 2. Update target to wasm32-wasip1 (Replaces deprecated wasm32-wasi)
if ! rustup target list --installed | grep -q "wasm32-wasip1"; then
    echo "Installing wasm32-wasip1 target..."
    rustup target add wasm32-wasip1
fi

# 3. Build using the correct target
echo "Building extension..."
cargo build --release --target wasm32-wasip1

echo "Build complete!"
