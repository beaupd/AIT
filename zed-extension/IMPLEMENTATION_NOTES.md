# Zed Extension Implementation Notes

## Current Status

The extension structure is complete, but HTTP API calls need to be implemented once the exact `zed_extension_api` v0.1.0 API is confirmed.

## Compilation Fixes Applied

✅ Fixed `SlashCommandOutput` to include required `sections` field
✅ Changed `handle_slash_command` to `run_slash_command`
✅ Fixed registration to use `#[zed_extension_api::init]` and `#[zed_extension_api::run_slash_command]`
✅ Removed `reqwest` dependency (not available in WASI)
✅ Fixed `worktree.root_path()` usage (returns String)
✅ Removed `command.arg` usage (doesn't exist in API)
✅ Removed `SlashCommandContext` (not in API)
✅ Simplified error handling

## Remaining Work

### HTTP API Implementation

The extension needs to make HTTP requests to the daemon, but `reqwest` is not available in WASI. Options:

1. **Use Zed's HTTP API** (if available):
   - Check `zed_extension_api` for HTTP request methods
   - May be named `http_request`, `request`, or similar
   - Signature likely: `async fn http_request(req: HttpRequest) -> Result<HttpResponse>`

2. **Use WASI-compatible HTTP client**:
   - `wasmtime` with WASI sockets
   - Custom HTTP implementation using WASI syscalls
   - May require additional capabilities in `extension.toml`

3. **Use process execution** (fallback):
   - Execute `curl` or `node` script via `process:exec` capability
   - Less efficient but works as fallback

### Command Arguments

The `refactor_function` command requires an argument, but `command.arg` doesn't exist. Options:

1. Parse from command name if Zed passes it differently
2. Use a prompt/input mechanism if Zed provides one
3. Make it optional and use a default

### Context Access

Need to access:
- Current file path
- Selected text
- Current buffer

The API may provide these through:
- `worktree` parameter
- Additional context parameter
- Settings/state access

## Testing Strategy

1. Build the extension with current code (should compile)
2. Install in Zed
3. Test each slash command
4. Check Zed logs for errors
5. Implement HTTP calls based on actual API
6. Add context access as needed

## Next Steps

1. **Verify API**: Check actual `zed_extension_api` v0.1.0 documentation or source
2. **Implement HTTP**: Add HTTP request functionality
3. **Add Context**: Access current file/buffer information
4. **Handle Arguments**: Implement command argument parsing
5. **Test**: Verify all commands work end-to-end

## Temporary Solution

The current implementation returns placeholder messages indicating that HTTP API implementation is needed. This allows:
- Extension to compile and install
- Commands to be visible in Zed
- Basic structure to be tested
- HTTP implementation to be added incrementally
