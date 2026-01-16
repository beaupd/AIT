#!/bin/bash

# Build script for AIT Zed Extension

set -e

echo "Building AIT Zed Extension..."

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "Error: Rust/Cargo is not installed"
    echo "Install from: https://rustup.rs/"
    exit 1
fi

# Check if wasm32-wasi target is installed
if ! rustup target list --installed | grep -q "wasm32-wasi"; then
    echo "Installing wasm32-wasi target..."
    rustup target add wasm32-wasi
fi

# Build the extension
echo "Building extension..."
cargo build --release --target wasm32-wasi

echo ""
echo "Build complete!"
echo ""
echo "To install in Zed:"
echo "  zed extensions install --dev ."
echo ""
echo "Or manually copy to:"
echo "  ~/.local/share/zed/extensions/ait/"
