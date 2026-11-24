# Ooz Downloads

Download pages and download counts for Ooz apps.

- `/` all apps · `/<slug>` an app's download page · `/d/<slug>` counts the download, then sends the current file
- Folders: only `api/` (files starting with `_` are helpers, not pages).
- Files: GitHub Releases of this repository (keep it **Public**). Icons and screenshots: Neon. Counts: Neon.
- Managed from the Ooz Drop app (`/api/admin`, needs the `x-admin-key` header).

## Vercel environment variables
| Name | Value |
|---|---|
| `DATABASE_URL` | Neon connection string |
| `GITHUB_TOKEN` | Fine-grained token, this repository only, Contents: Read and write |
| `ADMIN_KEY` | A password you choose (8+ characters), entered once in Ooz Drop |
| `OOZ_TZ` | optional, default `Africa/Cairo` |

Tests: `npm test`.

تصميم م. أسامة أبو الحسن
