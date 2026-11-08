# movan-platform

Full-stack web platform built on Cloudflare infrastructure.

## Stack
- **Frontend**: Next.js → Cloudflare Pages
- **Backend**: Cloudflare Worker (TypeScript)
- **Storage**: Cloudflare R2
- **Auth**: Google OAuth 2.0
- **API**: 9router API Proxy

## Structure
- `frontend/` — Next.js app
- `worker/` — Cloudflare Worker

## Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Worker
```bash
cd worker
npm install
npm run dev
```

## Deployment
- Frontend: Auto-deploy via GitHub Actions → CF Pages
- Worker: Auto-deploy via GitHub Actions → CF Workers
