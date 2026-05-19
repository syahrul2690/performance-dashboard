# Dashboard Kinerja PUSMANPRO

Full-stack KPI & performance dashboard for PT PLN (Persero) PUSMANPRO, built to mirror the RUPTL Dashboard architecture for future integration.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite 5 + TypeScript |
| Backend | NestJS 10 + Prisma 5 |
| Database | PostgreSQL 16 |
| Auth | JWT httpOnly cookies (15m access + 7d refresh rotation) |
| Charts | Chart.js 3.9.1 + react-chartjs-2 |
| Icons | lucide-react |
| Monorepo | pnpm workspaces |

## Quick Start (Dev)

```bash
# 1. Install deps
pnpm install

# 2. Copy env
cp .env.example .env

# 3. Start PostgreSQL
docker compose up -d

# 4. Migrate + seed
pnpm db:migrate
pnpm db:seed

# 5. Start dev servers
pnpm dev:api   # http://localhost:3000/api
pnpm dev:web   # http://localhost:5173
```

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| GM | gm@pusmanpro.pln.co.id | Pusmanpro@2026 |
| Sr. Manajer | srmanajer@pusmanpro.pln.co.id | Pusmanpro@2026 |
| Manajer | manajer@pusmanpro.pln.co.id | Pusmanpro@2026 |
| Asman | asman@pusmanpro.pln.co.id | Pusmanpro@2026 |
| Staff | staff@pusmanpro.pln.co.id | Pusmanpro@2026 |

## Screens

1. Executive Summary — health score, KPI cards, capacity addition chart, unit ranking
2. Cost & Capex — P&L, EVM, investasi per unit
3. Operasional KPI — KPI table dengan status Baik/Hati-hati/Buruk
4. Target Strategis — BSC perspectives + OKR
5. Human Capital — headcount, distribusi usia, sertifikasi
6. Manajemen Risiko — heat map 5×5 + risk register 20 risiko
7. Persetujuan Laporan — workflow approval 5 tahap role-gated
8. Kontrak Manajemen Usulan — WF-1/1b/2 + review approve/return
9. Kontrak Manajemen Realisasi — WF-3
10. Input Realisasi Bulanan — form KPI per unit
11. Pengaturan — profil, tema, audit log (GM/Sr. Manajer only)

## Integration with RUPTL Dashboard

This project deliberately mirrors the RUPTL Dashboard's architecture:
- Identical pnpm workspace layout (`apps/api`, `apps/web`)
- Same JWT cookie auth pattern & Axios interceptor (401→refresh→retry)
- Same `tsconfig.base.json` alias convention
- Same Docker/nginx layout
- Domain modules are namespace-isolated (`pusmanpro.*` audit actions)

To merge: share the auth domain or federate behind a common reverse proxy.

## Scripts

```bash
pnpm dev:api          # Start NestJS dev server
pnpm dev:web          # Start Vite dev server
pnpm db:migrate       # Run Prisma migrations
pnpm db:seed          # Seed demo data
pnpm typecheck        # Check both packages
pnpm -r build         # Build both packages
```

## Production

```bash
docker compose -f docker-compose.prod.yml up -d
```
