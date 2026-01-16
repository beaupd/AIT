.PHONY: build install clean test

build:
	@./build.sh

install: build
	@echo "Installing extension to Zed..."
	@mkdir -p ~/.local/share/zed/extensions/ait
	@cp target/wasm32-wasi/release/ait_zed_extension.wasm ~/.local/share/zed/extensions/ait/ 2>/dev/null || \
	 cp target/wasm32-wasi/release/libait_zed_extension.wasm ~/.local/share/zed/extensions/ait/ait_zed_extension.wasm
	@cp extension.toml ~/.local/share/zed/extensions/ait/
	@echo "Extension installed! Restart Zed to use it."

clean:
	@cargo clean

test:
	@echo "Note: Zed extensions are tested by installing and using in Zed"
	@echo "Build the extension and install it, then test commands in Zed"
