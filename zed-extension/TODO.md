# Zed Extension TODO

## Immediate Fixes Needed

- [ ] Implement HTTP requests using Zed's API (check actual method name/signature)
- [ ] Add context access for current file/buffer
- [ ] Implement command argument handling
- [ ] Test compilation with actual Rust toolchain
- [ ] Test installation in Zed
- [ ] Verify all slash commands work

## Implementation Priority

1. **HTTP API** - Critical for functionality
2. **Context Access** - Needed for file-specific commands
3. **Arguments** - Needed for refactor_function
4. **Error Handling** - Improve user feedback
5. **Settings** - Read daemon port from settings

## Resources

- Check `zed_extension_api` crate documentation
- Review Zed extension examples
- Test with actual Zed installation
- Check Zed logs for API errors
