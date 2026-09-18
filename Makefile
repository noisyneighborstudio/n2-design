.PHONY: dev build test lint clean install

install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

test:
	pnpm test

lint:
	pnpm lint

clean:
	pnpm clean

daemon:
	pnpm --filter @n2-design/daemon dev

web:
	pnpm --filter @n2-design/web dev

help:
	@echo "N2 Design - Makefile commands:"
	@echo ""
	@echo "  make install     Install all dependencies"
	@echo "  make dev         Start daemon + web in parallel"
	@echo "  make build       Build all packages"
	@echo "  make test        Run all tests"
	@echo "  make lint        Lint all packages"
	@echo "  make clean       Remove node_modules and build outputs"
	@echo "  make daemon      Start daemon only"
	@echo "  make web         Start web UI only"
	@echo "  make help        Show this help message"
