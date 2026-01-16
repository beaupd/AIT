# Zed Extension Development Notes

## API Compatibility

The Zed extension API may vary between versions. The current implementation uses:

- `zed_extension_api` crate (version 0.1)
- Slash commands for user interaction
- HTTP client for daemon communication

## Known API Limitations

The Zed extension API context methods may differ. If you encounter compilation errors:

1. Check the actual `zed_extension_api` version and documentation
2. Adjust method calls to match the actual API:
   - `cx.current_file_path()` might be `cx.current_buffer().file_path()`
   - `cx.selected_text()` might need different access pattern

## Building

The extension compiles to WebAssembly:

```bash
cargo build --release --target wasm32-wasi
```

The output will be in `target/wasm32-wasi/release/` with a name like:
- `ait_zed_extension.wasm` or
- `libait_zed_extension.wasm`

## Testing

Zed extensions are tested by:

1. Building the extension
2. Installing it to Zed's extensions directory
3. Restarting Zed
4. Using slash commands in the editor

## Future Improvements

- Better error handling and user feedback
- Settings integration for daemon port/URL
- Progress indicators for long-running operations
- Better context extraction from Zed editor state
