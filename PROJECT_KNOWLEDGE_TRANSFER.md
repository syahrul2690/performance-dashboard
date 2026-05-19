# RUPTL Dashboard — Project Knowledge Transfer

> Complete technical reference for replicating or starting a new project based on this architecture.

---

## 1. Project Overview

**RUPTL Dashboard** is a PLN (Indonesian state electricity company) internal web application for managing ~5,000 infrastructure projects across Indonesia. It provides:

- Interactive map visualization of project locations
- Multi-dimensional analytics (by stage, type, region, province, grid system)
- Role-based project CRUD and bulk Excel import
- Progress tracking per project (monthly plan vs. actual)
- Full audit log of all mutations

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React + Vite + TypeScript | React 19, Vite 5, TS 5.5 |
| **Backend** | NestJS + TypeScript | NestJS 10, Node.js 20 |
| **Database** | PostgreSQL | 16 (via Docker) |
| **ORM** | Prisma | 5.x |
| **Auth** | JWT (httpOnly cookies) + bcrypt | passport-jwt, bcrypt 5 |
| **HTTP Client** | Axios | 1.7 |
| **Map** | Leaflet + leaflet.markercluster | Leaflet 1.9 |
| **Table** | TanStack Table + TanStack Virtual | v8 |
| **Excel** | xlsx (SheetJS) | 0.18 — both API and web |
| **Monorepo** | pnpm workspaces | pnpm 9 |
| **Container** | Docker Compose + Nginx | nginx:alpine |
| **TLS** | Certbot / Let's Encrypt | via Docker |
| **Caching** | @nestjs/cache-manager (in-memory) | TTL 5 minutes |

---

## 3. Monorepo Structure

```
ruptl-dashboard/
├── package.json            # Root scripts (pnpm workspaces)
├── pnpm-workspace.yaml     # Declares apps/* as workspaces
├── tsconfig.base.json      # Shared TS config
├── docker-compose.yml      # Dev: Postgres only
├── docker-compose.prod.yml # Prod: DB + API + Web + Nginx + Certbot
├── .env.example            # Template for all required env vars
├── nginx/
│   └── nginx.conf          # Reverse proxy (HTTP→HTTPS, /api → NestJS, / → React)
└── apps/
    ├── api/                # NestJS backend
    │   ├── src/
    │   │   ├── main.ts
    │   │   ├── app.module.ts
    │   │   ├── auth/
    │   │   ├── users/
    │   │   ├── projects/
    │   │   ├── import/
    │   │   ├── analytics/
    │   │   ├── audit/
    │   │   ├── prisma/
    │   │   └── common/     # decorators, guards
    │   ├── prisma/
    │   │   ├── schema.prisma
    │   │   ├── seed.ts
    │   │   └── migrations/
    │   └── Dockerfile
    └── web/                # React + Vite SPA
        ├── src/
        │   ├── App.tsx
        │   ├── pages/
        │   ├── components/
        │   ├── context/
        │   └── lib/        # api.ts, types.ts
        ├── vite.config.ts
        └── Dockerfile
```

---

## 4. Database Schema (Prisma)

### Enums

```prisma
enum Role           { ADMIN | PIC | MANAGEMENT }
enum ProjectStage   { OBC | CENTRALIZED_PLANNING | TVV | KOMITE_INVESTASI | RKAP | SKAI | RENDAN | LAKDAN | KONSTRUKSI | COD }
enum ProjectType    { GI | TRANS | KIT | KIT_EBT | KIT_NONEBT | FSRU | KIT_RELOKASI }
```

### Models

**User** — Auth + role-based access
```
id, email (unique), passwordHash, name, role, isActive, createdAt, updatedAt
relations: projects (CreatedBy), updatedProjects (UpdatedBy)
```

**Project** — Core entity (~25 fields)
```
id (cuid), name, type, subtype, ruptlCode (unique), stage, status, priority
codTargetRUPTL, codKontraktual, codEstimasi
issueType, issueStrategic
progressPlan, progressRealisasi, deviasi  (Float)
lat?, lng?  (Float, nullable)
island, region, province, gridSystem
capacity?, capacityUnit?, circuitLength?, voltageLevel?
lineFromId?, lineToId?   (self-reference to other Projects)
notification?, bpoNotes?, bpoLastModified?
comment?, detail?
urgencyCategory  String[]  (multi-select)
relatedProjects  String[]  (array of Project IDs)
createdById, updatedById  (User FK)
createdAt, updatedAt

Indexes: stage, province, island, region, type, (province, stage)
```

**ProjectProgress** — Monthly plan vs actual
```
id, projectId (FK), yearMonth (String "YYYY-MM"), plan (Float), actual (Float?)
Unique: (projectId, yearMonth)
```

**AuditLog** — Immutable event log
```
id, userId, userEmail, action, entity, entityId?, diff (Json?), ip?, createdAt
Indexes: (entity, entityId), (userId, createdAt), (createdAt)
```

---

## 5. Backend Architecture (NestJS)

### Module Map

```
AppModule
├── ConfigModule (global)          — env vars
├── CacheModule (global, TTL 5min) — in-memory cache
├── PrismaModule                   — database client
├── AuthModule                     — login/logout/refresh/me
├── UsersModule                    — CRUD (ADMIN only)
├── ProjectsModule                 — CRUD + filters + pagination + progress
├── ImportModule                   — Excel bulk import
├── AnalyticsModule                — aggregation queries (cached)
└── AuditModule                    — event log
```

### Auth Flow

1. **Login** (`POST /api/auth/login`) — validates email/password with bcrypt, signs two JWTs, sets as `httpOnly` cookies
   - `access_token`: 15 min expiry, contains `{ sub, email, role }`
   - `refresh_token`: 7 day expiry, contains `{ sub }`
2. **Refresh** (`POST /api/auth/refresh`) — reads refresh cookie, issues new token pair (rotation)
3. **Logout** — clears both cookies
4. **me** (`GET /api/auth/me`) — returns current user from access token
5. Passport strategies: `access` (JwtStrategy reading cookie) and `refresh`

### Guards & Decorators

- `AuthGuard('access')` — validates access JWT from cookie
- `RolesGuard` — enforces `@Roles(Role.ADMIN, Role.PIC)` decorator
- `@CurrentUser()` — extracts user from request
- `@Roles(...)` — sets role metadata

### API Endpoints

| Method | Path | Roles | Notes |
|---|---|---|---|
| POST | `/api/auth/login` | public | sets cookies |
| POST | `/api/auth/refresh` | refresh cookie | rotates tokens |
| POST | `/api/auth/logout` | any | clears cookies |
| GET | `/api/auth/me` | any | current user |
| GET | `/api/projects` | any | list + filters + pagination |
| GET | `/api/projects/:id` | any | full project detail |
| POST | `/api/projects` | ADMIN, PIC | create |
| PUT | `/api/projects/:id` | ADMIN, PIC | update |
| DELETE | `/api/projects/:id` | ADMIN, PIC | delete |
| GET | `/api/projects/:id/progress` | any | monthly progress |
| PUT | `/api/projects/:id/progress` | ADMIN, PIC | upsert progress rows |
| POST | `/api/projects/import/preview` | ADMIN, PIC | validate Excel, return preview |
| POST | `/api/projects/import/commit` | ADMIN, PIC | upsert all rows from Excel |
| GET | `/api/analytics/summary` | any | aggregated stats (cached 5 min) |
| GET | `/api/users` | ADMIN | list users |
| POST | `/api/users` | ADMIN | create user |
| PUT | `/api/users/:id` | ADMIN | update user |
| DELETE | `/api/users/:id` | ADMIN | delete user |
| GET | `/api/audit-log` | ADMIN | paginated audit log |

### Project List Query Params (`GET /api/projects`)

| Param | Type | Notes |
|---|---|---|
| `fields` | `'slim'` | returns only map-needed fields |
| `stage` | ProjectStage | filter |
| `status` | string | filter |
| `type` | ProjectType | filter |
| `province` | string | filter |
| `island` | string | filter |
| `region` | string | filter |
| `urgency` | string | `has` array filter |
| `search` | string | ilike on name/ruptlCode/province |
| `sort` | string | column name (whitelist enforced) |
| `order` | `'asc'` \| `'desc'` | |
| `page` | number | default 1 |
| `limit` | number | default 50 |

### Caching Strategy

- `analytics:summary` key — cached 5 min in-memory after first query
- Cache is **invalidated** on any project create/update/delete/import
- Uses `@nestjs/cache-manager` with `CACHE_MANAGER` injection token

### Excel Import Logic (2-pass upsert)

1. **Parse** — reads `ALL` sheet (falls back to first sheet), uses row 1 as header, data from row 2
2. **Validate** — checks required fields, maps stage/type strings to enum values
3. **Pass 1** — `upsert` each project by `ruptlCode` (create or update)
4. **Pass 2** — resolve relationship codes (`lineFromCode`, `lineToCode`, `relatedCodes`) to IDs, then update

Column mappings from Excel headers → DB fields (key examples):
- `NAMA PROYEK` → `name`
- `RUPTL CODE` → `ruptlCode`
- `ACTUAL STAGE` → `stage` (via STAGE_MAP)
- `TIPE PROYEK` → `type` (via TYPE_MAP)
- `REGION` → `region`, also derives `island` via REGION_TO_ISLAND map
- `LOKASI` → `province`
- `SISTEM KELISTRIKAN` → `gridSystem`
- `Latitude` / `Longitude` → `lat` / `lng`
- `KAPASITAS` / `SATUAN` → `capacity` / `capacityUnit`

---

## 6. Frontend Architecture (React + Vite)

### Pages & Routes

| Path | Page | Roles | Description |
|---|---|---|---|
| `/login` | LoginPage | public | Email + password form |
| `/` | MapPage | all | Leaflet map with cluster markers |
| `/analytics` | AnalyticsPage | all | Charts/stats from analytics API |
| `/data-proyek` | DataProyekPage | all | Paginated table (TanStack Table + Virtual) |
| `/input` | InputPage | ADMIN, PIC | Create/edit project form + Excel import |
| `/admin` | AdminPage | ADMIN | User management + audit log |

### Context Providers (wraps entire app)

```
ThemeProvider        — dark / SIMPP (light) themes, persisted in localStorage
  ProjectStatsProvider — fetches analytics summary, shares across pages
    AuthProvider       — user state, login/logout, auto-refresh on 401
      BrowserRouter    — routing
```

### Auth Context Pattern

- On mount: calls `GET /api/auth/me` to restore session
- Axios interceptor catches 401 → calls `POST /api/auth/refresh` once, queues concurrent requests
- On refresh failure → redirects to `/login`
- `Protected` HOC wraps each route, checks `user` and optional `roles`

### Theme System

Two themes: `dark` and `simpp` (PLN light theme)

Each exports a color token object:
```typescript
{ bgPage, bgCard, bgNavbar, bgInput, border, borderInput,
  textPrimary, textSec, textMuted, accent, navActive, navActiveBg,
  hoverBg, divider, hbarTrack, spinnerBdr, spinnerTop, statusBar }
```

Usage: `const c = useColors()` — all inline styles reference `c.tokenName`.
Theme toggle stored in `localStorage` key `ruptl-theme`.

### API Client (`src/lib/api.ts`)

Single Axios instance with:
- `baseURL: '/api'`
- `withCredentials: true` (sends cookies)
- 401 interceptor with refresh + queue pattern

Exported namespaces:
- `authApi` — login, logout, me
- `projectsApi` — listSlim, list, get, create, update, remove, importPreview, importCommit, getProgress, upsertProgress
- `analyticsApi` — summary
- `usersApi` — list, create, update, remove
- `auditApi` — list

### Key Type Definitions (`src/lib/types.ts`)

- `Role` — `'ADMIN' | 'PIC' | 'MANAGEMENT'`
- `ProjectStage` — 10 values (see enum above)
- `ProjectType` — 7 values
- `ProjectSlim` — map-only fields (id, lat, lng, stage, status, type, etc.)
- `Project extends ProjectSlim` — full detail
- `PaginatedResponse<T>` — `{ data, total, page, limit }`
- `ProjectFilters` — query param shape
- `STAGE_CONFIG` — stage → `{ color, bg, glow, label }` mapping
- `STATUS_OPTIONS`, `STATUS_COLORS`
- `TYPE_LABELS`
- `URGENCY_OPTIONS`, `URGENCY_COLORS`
- `REGION_OPTIONS`, `PROVINCE_OPTIONS`

---

## 7. Domain Data Reference

### Project Stages (10 steps)

| # | Enum | Label | Color |
|---|---|---|---|
| 1 | OBC | 01. OBC | Gray |
| 2 | CENTRALIZED_PLANNING | 02. CP | Violet |
| 3 | TVV | 03. TVV | Indigo |
| 4 | KOMITE_INVESTASI | 04. KI | Blue |
| 5 | RKAP | 05. RKAP | Sky |
| 6 | SKAI | 06. SKAI | Emerald |
| 7 | RENDAN | 07. RENDAN | Light Green |
| 8 | LAKDAN | 08. LAKDAN | Yellow |
| 9 | KONSTRUKSI | 09. Konstruksi | Amber |
| 10 | COD | 10. COD | Green |

### Project Types (7 types)

| Enum | Label |
|---|---|
| GI | Gardu Induk |
| TRANS | Transmisi |
| KIT | KIT |
| KIT_EBT | KIT-EBT |
| KIT_NONEBT | KIT-NONEBT |
| FSRU | FSRU |
| KIT_RELOKASI | KIT (Relokasi) |

### Regions → Islands

| Region | Island Group |
|---|---|
| JAMALI | Jawa |
| SUMATERA | Sumatera |
| SULAWESI | Sulawesi |
| KALIMANTAN | Kalimantan |
| MAPA | Papua |
| NUSRA | Nusa Tenggara |

### Status Values

`Leading | Lagging | On-track | Completed | Cancelled | Terminasi | Started`

### Urgency Categories (multi-select array on each project)

`RUPTL | Pemenuhan EBT | NON LIST | Kerawanan Sistem | Keandalan Sistem | Evakuasi Daya | KTT | Interkoneksi | Penurunan BPP | Demand KTT`

---

## 8. Environment Variables

```bash
# Database
DATABASE_URL=postgresql://USER:PASS@localhost:5432/DB_NAME

# PostgreSQL (docker-compose)
POSTGRES_USER=ruptl
POSTGRES_PASSWORD=...
POSTGRES_DB=ruptl_db

# Domain (prod only, no https://)
DOMAIN=yourdomain.com

# JWT
JWT_ACCESS_SECRET=<openssl rand -hex 64>
JWT_REFRESH_SECRET=<different openssl rand -hex 64>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Seed admin
ADMIN_EMAIL=admin@pln.local
ADMIN_PASSWORD=Admin@1234
ADMIN_NAME=Administrator

# API
API_PORT=3000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Dev
COOKIE_SECURE=false   # set to disable secure flag for non-HTTPS dev
```

---

## 9. Local Development Setup

```bash
# Prerequisites: Node.js 20+, pnpm 9+, Docker

# 1. Install dependencies
pnpm install

# 2. Start Postgres
docker compose up -d

# 3. Copy and configure env
cp .env.example apps/api/.env
# Edit DATABASE_URL, JWT secrets, etc.

# 4. Run migrations + seed admin user
pnpm db:migrate
pnpm db:seed

# 5. Start API (terminal 1)
pnpm dev:api        # http://localhost:3000/api

# 6. Start web (terminal 2)
pnpm dev:web        # http://localhost:5173

# Optional: open Prisma Studio
pnpm db:studio
```

Default dev credentials: `admin@pln.local` / `Admin@1234`

---

## 10. Production Deployment

### Docker Compose (prod)

Services in `docker-compose.prod.yml`:
- `db` — postgres:16-alpine, internal network only
- `api` — NestJS, built from `apps/api/Dockerfile`
- `web` — React SPA, built from `apps/web/Dockerfile`, served by nginx-alpine
- `nginx` — reverse proxy, ports 80+443
- `certbot` — Let's Encrypt TLS

### Nginx Routing

```
HTTP  :80  → redirect to HTTPS (except /.well-known/acme-challenge/)
HTTPS :443
  /api/*  → proxy to api:3000
  /*      → proxy to web:80 (SPA, catch-all to index.html)
```

`client_max_body_size 25M` — required for Excel file uploads.

### Manual Deploy Workflow

```bash
# 1. On VPS: pull latest
git pull origin main

# 2. Rebuild API only
docker compose -f docker-compose.prod.yml up -d --build api

# 3. Rebuild web only
docker compose -f docker-compose.prod.yml up -d --build web

# 4. Rebuild both
docker compose -f docker-compose.prod.yml up -d --build api web
```

### GitHub Actions Auto-Deploy

Trigger: push to `main` → SSH into VPS → git pull + docker rebuild.

Required secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`

---

## 11. Key Architectural Decisions

| Decision | Rationale |
|---|---|
| **httpOnly cookie auth** (not localStorage) | Prevents XSS token theft; refresh rotation on every request |
| **Slim vs Full project response** | `?fields=slim` returns only 12 fields needed for map markers; reduces payload from ~100 fields |
| **In-memory cache for analytics** | Analytics queries are expensive (multiple aggregations); 5 min TTL acceptable for dashboard |
| **Cache invalidation on mutation** | Ensures analytics are always consistent after writes; avoids stale counts |
| **2-pass import** | Projects reference each other by `ruptlCode`; both ends of a relationship need to exist before linking |
| **pnpm workspaces monorepo** | Single `pnpm install`, shared TypeScript config, single git repo for CI |
| **No UI library** | All styling is inline with theme token objects (`c.bgCard`, etc.) — avoids CSS bundler complexity |
| **TanStack Virtual** | Renders only visible rows in the 25-column DataProyek table; handles thousands of rows smoothly |
| **Postgres array columns** | `urgencyCategory String[]` and `relatedProjects String[]` avoid join tables for simple multi-value fields |

---

## 12. Implementation Checklist for New Project

Use this as a step-by-step guide when replicating or adapting this stack:

### Phase 1: Foundation
- [ ] Init pnpm workspace with `apps/api` and `apps/web`
- [ ] Setup `tsconfig.base.json` with path aliases
- [ ] Add `docker-compose.yml` for local Postgres
- [ ] Create `.env.example` with all required variables

### Phase 2: Backend
- [ ] Init NestJS project (`nest new api --package-manager pnpm`)
- [ ] Install: `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `@nestjs/cache-manager`, `passport-jwt`, `bcrypt`, `cookie-parser`, `class-validator`, `class-transformer`, `prisma`, `@prisma/client`
- [ ] Setup Prisma schema (define enums + models with indexes)
- [ ] Implement `PrismaModule` as global singleton
- [ ] Implement `AuditModule` (log all mutations)
- [ ] Implement `AuthModule` with httpOnly cookie pattern + refresh rotation
- [ ] Add `AccessGuard`, `RefreshGuard`, `RolesGuard`, `@CurrentUser()`, `@Roles()`
- [ ] Implement domain modules (projects, users, etc.) with full CRUD
- [ ] Add pagination pattern: `{ data, total, page, limit }` response shape
- [ ] Add slim field select for list endpoints
- [ ] Wire `CacheModule` for expensive aggregation endpoints
- [ ] Invalidate cache on all writes
- [ ] Implement Excel import with 2-pass upsert if entities cross-reference
- [ ] Add `ValidationPipe` globally with `whitelist: true, forbidNonWhitelisted: true`
- [ ] Configure CORS with `credentials: true` and explicit origin
- [ ] Write `seed.ts` to create initial admin user

### Phase 3: Frontend
- [ ] Init Vite + React + TypeScript (`pnpm create vite`)
- [ ] Install: `react-router-dom`, `axios`, `@tanstack/react-table`, `@tanstack/react-virtual`
- [ ] Configure Vite dev proxy: `/api → http://localhost:3000`
- [ ] Create Axios instance with `withCredentials: true` and 401 interceptor (refresh + queue)
- [ ] Create `AuthContext` (restore session on mount, login/logout methods)
- [ ] Create `ThemeContext` with dark/light tokens + `useColors()` hook
- [ ] Create `Protected` HOC with optional role check
- [ ] Define all TypeScript types to match Prisma schema enums/models
- [ ] Define constants: stage config (color+label), status options, urgency options, regions/provinces
- [ ] Build pages using only `useColors()` tokens for all styling (no CSS library)
- [ ] Add `ProjectStatsContext` to share analytics across pages

### Phase 4: Map
- [ ] Install `leaflet`, `leaflet.markercluster`, `@types/leaflet`
- [ ] Fetch slim project list (up to 5000 items) on map load
- [ ] Color markers by stage using STAGE_CONFIG
- [ ] Enable cluster with `leaflet.markercluster`
- [ ] Handle TRANS type (no lat/lng) separately — draw lines if `lineFromId`/`lineToId` available

### Phase 5: Infrastructure
- [ ] Write multi-stage `Dockerfile` for API (build → dist → node:slim runtime)
- [ ] Write multi-stage `Dockerfile` for web (build → nginx:alpine serve)
- [ ] Write `nginx.conf` (HTTP→HTTPS redirect, `/api` proxy, SPA catch-all)
- [ ] Write `docker-compose.prod.yml` with internal network, certbot
- [ ] Add GitHub Actions workflow for SSH deploy on push to main
- [ ] Test Certbot flow for TLS cert issuance

---

## 13. Potential Improvements / What's Missing

- **No test suite** — no unit or e2e tests exist; adding Jest + Supertest for API would be the priority
- **In-memory cache** — restarting the API clears the cache; Redis would survive restarts and allow multi-instance scaling
- **No rate limiting** — login endpoint has no brute-force protection; consider `@nestjs/throttler`
- **No swagger** — adding `@nestjs/swagger` would auto-generate API docs from DTOs
- **Refresh token not stored** — no blacklist/revocation; stolen refresh tokens remain valid until expiry
- **Single admin at seed** — no self-registration; admin must create all users manually
- **No file size validation on import** — only Nginx `client_max_body_size 25M` guards this
