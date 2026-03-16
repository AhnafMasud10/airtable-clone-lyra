# Lyra Airtable – Full Project Context for Claude Code

## Overview

**Lyra Airtable** is an Airtable-style spreadsheet/database app built with the T3 stack. Users can create bases, tables with columns (fields), rows (records), and cells. It includes a virtualized grid view, views sidebar, table tabs, filtering, sorting, and optimistic updates.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Database**: PostgreSQL via Prisma 7 (with `@prisma/adapter-pg` for connection pooling)
- **API**: tRPC v11
- **Data fetching**: TanStack Query (React Query)
- **Grid**: TanStack Table + TanStack Virtual for virtualization
- **Auth**: NextAuth 5 beta (currently **disabled** – no auth required; uses demo user for base creation)
- **Styling**: Tailwind CSS 4
- **Runtime**: Bun (package manager), Node for Next.js

---

## Project Structure

```
lyra-airtable-6/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Seed script (creates demo base with tables)
│   └── migrations/        # SQL migrations
├── src/
│   ├── app/
│   │   ├── layout.tsx     # Root layout
│   │   ├── (protected)/   # Route group (no auth redirect currently)
│   │   │   ├── layout.tsx # Just renders children
│   │   │   ├── page.tsx   # Home: lists bases
│   │   │   └── base/[baseId]/
│   │   │       ├── page.tsx   # Redirects to first table/view
│   │   │       └── table/[tableId]/
│   │   │           ├── page.tsx
│   │   │           └── view/[viewId]/page.tsx
│   │   └── api/
│   │       ├── trpc/[trpc]/route.ts
│   │       └── auth/[...nextauth]/route.ts
│   ├── features/
│   │   ├── home/          # Home page (bases list, sidebar, topbar)
│   │   ├── workspace/grid/ # Grid UI (table tabs, views sidebar, grid, toolbar)
│   │   └── auth/          # UserMenu (unused when auth disabled)
│   ├── server/
│   │   ├── api/
│   │   │   ├── root.ts    # tRPC app router
│   │   │   ├── trpc.ts    # tRPC setup, publicProcedure
│   │   │   ├── auth-helpers.ts  # Ownership helpers (kept for future auth)
│   │   │   └── routers/   # base, table, field, record, cell, view, post
│   │   ├── auth/          # NextAuth config
│   │   └── db.ts          # Prisma client
│   ├── trpc/              # React Query + tRPC client
│   └── types/             # base-table.ts (Zod schemas)
├── generated/prisma/      # Prisma client output
└── scripts/migrate-to-neon.sh
```

---

## Database Schema (Prisma)

- **User** – id, name, email (auth models; used for base ownership)
- **Account**, **Session**, **VerificationToken** – NextAuth
- **Base** – id, name, ownerId; has many Tables
- **Table** (AirtableTable) – id, name, baseId; has many Views, Fields, Records
- **View** – id, name, type (GRID, KANBAN, etc.), tableId, config (JSON)
- **Field** – id, name, type (TEXT, NUMBER, etc.), tableId, order, options
- **Record** – id, tableId, order
- **Cell** – id, recordId, fieldId, value (composite unique on recordId+fieldId)

---

## tRPC API (all publicProcedure, no auth)

| Router | Procedures |
|--------|------------|
| **base** | list, getById, create (uses demo user if no ownerId) |
| **table** | listByBase, getById, create, createWithDefaults, bulkInsertRows, getGridWindow |
| **field** | listByTable, create, update, delete |
| **record** | listByTable, create, delete |
| **cell** | upsert |
| **view** | listByTable, create, update, saveConfig, delete |

**getGridWindow** – Paginated grid query with:
- `tableId`, `cursor`, `limit`, `globalSearch`, `filters`, `sorts`, `hiddenFieldIds`
- Returns `rows`, `fields`, `nextCursor`, `total`
- Uses raw SQL for filtering/sorting for performance

---

## Key Routes

| Path | Description |
|------|-------------|
| `/` | Home – lists bases, create base button |
| `/base/[baseId]` | Redirects to first table’s first view |
| `/base/[baseId]/table/[tableId]` | Grid for table (default view) |
| `/base/[baseId]/table/[tableId]/view/[viewId]` | Grid with specific view |

---

## Main UI Components

### Home
- **HomePageShell** – Layout with sidebar, topbar, content
- **HomeSidebar** – Nav, create base, upgrade banner
- **HomeContent** – Base cards, create base button
- **HomeTopbar** – Search, help, notifications, avatar (no auth UI)

### Grid Workspace
- **BaseGridPageClient** – Main client; manages selected table/view, grid state, mutations
- **TopBar** – Base name, Data/Automations/Interfaces/Forms, Share, etc.
- **TableTabs** – Green toolbar with table tabs, “Add or import” dropdown (portal), Tools
- **ViewsSidebar** – Create view, find view, list of views (Grid, Timeline, etc.)
- **GridToolbar** – Add field, filters, sorts, etc.
- **GridTable** – Virtualized table (TanStack Table + Virtual)
- **GridCell** – Editable cell with optimistic updates

---

## State & Data Flow

- **BaseGridPageClient** holds: `selectedTableId`, `selectedViewId`, `globalSearch`, `filters`, `sorts`, `hiddenFieldIds`, `editingCell`, `sidebarCollapsed`
- **getGridWindow** – Infinite query, PAGE_SIZE=300
- **Optimistic updates** for: add row, add column, cell edit
- View config (filters, sorts, etc.) stored in `View.config` JSON

---

## Environment Variables

```env
DATABASE_URL=postgresql://...   # Required
AUTH_SECRET=...                 # Optional in dev, required in prod
AUTH_GOOGLE_ID=...              # Optional
AUTH_GOOGLE_SECRET=...          # Optional
NEON_DATABASE_URL=...           # For migrate-to-neon script
```

---

## Scripts

```bash
bun run dev          # Next.js dev (turbo)
bun run build        # Production build
bun prisma/seed.ts   # Seed database
bun prisma/verify.ts # Verify DB state
./scripts/migrate-to-neon.sh  # Migrate local DB to Neon
```

---

## Current State & Notes

1. **No auth** – All tRPC procedures are `publicProcedure`. Base creation uses first user or creates a demo user.
2. **TableTabs** – “Add or import” dropdown uses React Portal (renders to `document.body`) to avoid overflow clipping. “Start from scratch” calls `onAddTable`.
3. **Optimistic updates** – Add row/column and cell edit use `onMutate` for instant UI; `onSuccess` merges server response.
4. **Hydration** – `suppressHydrationWarning` on `<html>` and `<body>` for extension-related mismatches.
5. **Neon** – Deploy guide in DEPLOY.md; use pooled connection string.
6. **Prisma client** – Output to `generated/prisma`; use `PrismaClient` from there.

---

## File Reference (Key Files)

- `src/features/workspace/grid/base-grid-page-client.tsx` – Grid layout, mutations, optimistic logic
- `src/features/workspace/grid/table-tabs.tsx` – Table tabs, Add or import dropdown
- `src/features/workspace/grid/grid-table.tsx` – Virtualized grid
- `src/features/workspace/grid/views-sidebar.tsx` – Views list
- `src/features/workspace/grid/grid-toolbar.tsx` – Add field, filters, sorts
- `src/server/api/routers/table.ts` – getGridWindow, createWithDefaults, bulkInsertRows
- `src/types/base-table.ts` – Zod schemas for API
- `prisma/schema.prisma` – Full schema
