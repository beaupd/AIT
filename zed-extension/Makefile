.PHONY: build install clean test

build:
	@./build.sh

install: build
	@echo "Installing extension to Zed..."
	@mkdir -p ~/.local/share/zed/extensions/ait
	@if [ -f extension.wasm ]; then \
		cp extension.wasm ~/.local/share/zed/extensions/ait/; \
		echo "✓ Copied extension.wasm"; \
	else \
		echo "Error: extension.wasm not found. Run 'make build' first."; \
		exit 1; \
	fi
	@cp extension.toml ~/.local/share/zed/extensions/ait/
	@echo "✓ Copied extension.toml"
	@echo "Extension installed! Restart Zed to use it."

clean:
	@cargo clean
	@rm -f extension.wasm
	@echo "Cleaned build artifacts and extension.wasm"

test:
	@echo "Note: Zed extensions are tested by installing and using in Zed"
	@echo "Build the extension and install it, then test commands in Zed"
