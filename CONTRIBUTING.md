# Contributing

Thanks for your interest in building on AletheiaX.

## Layout
- `packages/ts-sdk` — TypeScript SDK (`@aletheiax/sdk`)
- `packages/py-sdk` — Python SDK (`aletheiax`)
- `docs/` — architecture, agents, token, and trust documentation

## Development
- TypeScript: `cd packages/ts-sdk && npm install && npm run typecheck && npm test`
- Python: `cd packages/py-sdk && pip install -e ".[dev]" && pytest`

## Pull requests
- Keep SDK changes type-safe and covered by a test.
- The SDKs wrap the public API only — no secrets, no platform internals.
- Both packages must pass CI (see `.github/workflows/ci.yml`).
