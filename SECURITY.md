# Security Policy

## Scope
This repository contains the AletheiaX **SDKs** (TypeScript + Python) and documentation. The SDKs
wrap the platform's public API and contain no secrets, keys, or platform internals.

## Reporting a vulnerability
If you find a security issue in an SDK, please email **security@aletheiax.xyz** rather than opening a
public issue. We aim to acknowledge within 72 hours.

For issues in the hosted platform (custody, settlement, matching), use the same address and mark the
subject `[platform]`.

## Good practice when integrating
- Never commit API tokens or wallet keys. The SDKs read tokens you pass at runtime.
- Treat `auth.login` JWTs as secrets; store them securely.
