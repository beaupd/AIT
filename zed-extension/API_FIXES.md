# Zed Extension API Fixes Needed

## Current Issues

The Zed extension API v0.1.0 has a different structure than expected. Based on compilation errors:

### 1. HTTP Requests
- `reqwest` is not available in WASI environment
- Need to use Zed's built-in HTTP capabilities
- The actual API method name/signature needs to be verified

### 2. SlashCommandOutput
- Requires `sections` field (array of `SlashCommandOutputSection`)
- Each section has: `range`, `icon`, `text`

### 3. Registration
- Use `#[zed_extension_api::init]` for initialization
- Use `#[zed_extension_api::run_slash_command]` for slash commands
- Function signature: `async fn run_slash_command(extension: &mut AITExtension, command: SlashCommand, worktree: &zed::Worktree) -> Result<SlashCommandOutput>`

### 4. Worktree API
- `worktree.root_path()` returns `String`, not `PathBuf`
- No `current_buffer()` method available in the context
- Need to check actual API for accessing current file/buffer

### 5. Command Arguments
- `command.arg` doesn't exist
- Arguments may be passed differently or need to be parsed from command name

## Next Steps

1. Check actual `zed_extension_api` v0.1.0 documentation
2. Verify HTTP API method signature
3. Test with actual Zed installation
4. Adjust based on runtime behavior

## Temporary Solution

The current implementation uses placeholders for HTTP calls. Once the actual API is verified, replace:
- HTTP request methods
- Context access methods
- Command argument parsing
