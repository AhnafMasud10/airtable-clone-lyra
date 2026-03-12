# Airtable Frontend Prompt Pack

Use this with Cursor/LLM to implement a scalable Airtable-style frontend on top of the existing backend (`tRPC + Prisma` already set up).

## Master Prompt (Copy/Paste)

```md
You are a senior frontend engineer. Build a production-grade Airtable-style frontend in this Next.js App Router codebase.

## Context

- Backend is already implemented with tRPC routers and contracts for:
  - `base`, `table`, `view`, `field`, `record`, `cell`
- Stack:
  - Next.js App Router + TypeScript + Tailwind
  - tRPC React Query (`src/trpc/react.tsx`, `src/trpc/server.ts`)
  - Contract-first schemas in `src/types/base-table.ts`
- Goal:
  - Airtable-like UX from Home page (bases) to Base/Table workspace (views, columns, rows, cells).
  - Keep architecture scalable, fast, and maintainable.

## Design Targets

- Airtable-inspired (not exact clone): clean spacing, light neutral palette, compact data UI.
- Screens:
  1. `/` Home: left sidebar + base cards + recent/opened sections.
  2. `/base/[baseId]`: table tabs, left views panel, toolbar, main view renderer.
  3. View types: at minimum `GRID`, then pluggable support for `KANBAN`, `CALENDAR`, `TIMELINE`.

## Required Architecture

- Use feature-first structure:
  - `src/features/bases/...`
  - `src/features/tables/...`
  - `src/features/views/...`
  - `src/features/grid/...`
  - shared UI in `src/components/ui/...`
- Server/client boundaries:
  - RSC for initial page data fetch where appropriate.
  - Client components for interactive regions (editing, keyboard nav, drag/resizing later).
- All data access via tRPC only (no direct DB usage in UI).
- Strong typing from `RouterOutputs` / `RouterInputs`; do not duplicate backend types manually.

## Data + Query Rules

- Query keys must stay predictable by entity:
  - bases list
  - tables by base
  - views/fields/records by table
- Mutations must invalidate minimal necessary scopes.
- Use optimistic updates for cell edits with rollback on failure.
- Avoid refetch storms: memoize derived maps/selectors.

## UX Requirements (MVP)

- Home page:
  - Sidebar nav + create button
  - Base cards list from `api.base.list`
  - Empty/loading/error states
- Base page:
  - Table tab strip from `api.table.listByBase`
  - Left views panel from `api.view.listByTable`
  - Toolbar row (hide fields/filter/sort/group placeholders are fine)
- Grid view:
  - Sticky header row for fields
  - Rows rendered from records
  - Inline cell editing (single-click focus, Enter save, Esc cancel)
  - Add row button (`record.create`)
  - Add column button (`field.create`)
  - Update cell via `cell.upsert`

## Performance + Scalability

- Split large interactive regions into isolated client components.
- Use virtualization for rows (or architect to drop-in virtualization with minimal refactor).
- Keep rerenders small:
  - stable callbacks
  - `React.memo` where useful
  - avoid passing large mutable objects through deep trees
- Create a small view-renderer registry pattern:
  - `const viewRenderers: Record<ViewType, ReactComponent>`
  - default to Grid; placeholders for others.

## Code Quality

- Keep components small and focused; move logic to hooks:
  - `useBaseData`, `useTableData`, `useGridEditing`
- Add concise comments only where behavior is non-obvious.
- No `any`.
- Handle loading/error/empty on every critical data panel.
- Ensure keyboard accessibility for core actions.

## Deliverables

1. File/folder structure updates (feature-first).
2. Home page implementation.
3. Base workspace page implementation.
4. Grid view with inline editing + create row/column.
5. View switcher with renderer registry and placeholder view components.
6. Query/mutation hooks and invalidation strategy.
7. Brief README section summarizing architecture and extension points.

## Execution Style

- Work iteratively and verify after each milestone with typecheck/lint.
- Show changed files and rationale.
- Favor maintainability over shortcuts.
```

## Phased Prompts (Optional)

### Phase 1: Shell + Home

```md
Implement only Phase 1 frontend:

- Build Airtable-style app shell (sidebar/top-level layout) and Home page at `/`.
- Fetch and render bases via `api.base.list`.
- Add polished loading/empty/error states.
- Keep feature-first organization (`features/bases`, shared UI).
- No table grid editing yet.

Constraints:

- Type-safe only.
- No direct DB calls.
- Keep components reusable for later phases.
```

### Phase 2: Base Workspace

```md
Implement only Phase 2:

- Create `/base/[baseId]` route.
- Show table tabs from `api.table.listByBase`.
- Show views panel from `api.view.listByTable`.
- Add toolbar with placeholders for filter/sort/group/hide-fields.
- Wire selected table/view into URL search params.

Constraints:

- RSC for initial fetch, client components for interactions.
- Clean query key and invalidation strategy.
```

### Phase 3: Grid MVP

```md
Implement only Phase 3:

- Build `GridView` renderer for selected table.
- Render fields as headers and records as rows.
- Inline cell edit with keyboard support (Enter/Escape/Tab basics).
- Mutations:
  - `record.create`
  - `field.create`
  - `cell.upsert`
- Add optimistic update for cell edits and rollback on error.

Constraints:

- Keep logic in hooks (`useGridEditing`, `useGridData`).
- Prepare for future virtualization.
```

### Phase 4: Multi-View Foundation

```md
Implement only Phase 4:

- Add view renderer registry keyed by `ViewType`.
- Fully implement `GRID`.
- Create placeholder components for `KANBAN`, `CALENDAR`, `TIMELINE`.
- Persist selected view in URL and keep transitions smooth.

Constraints:

- Easy to add new view types without touching core page logic.
- Strong typing across registry and props.
```

### Phase 5: Polish + Hardening

```md
Implement only Phase 5:

- Performance polish (memoization, split boundaries, avoid unnecessary rerenders).
- Accessibility polish (focus states, aria labels, keyboard traversal).
- Add concise docs in README:
  - architecture
  - data flow
  - extension points for new views/actions.
- Ensure lint/typecheck pass.
```

## Senior SWE Frontend Checklist

Use this as a quality bar before merging:

- **Architecture:** feature-first modules, clear server/client boundaries, reusable UI primitives.
- **Contracts:** all component data typed from tRPC outputs; no duplicate domain types drifting from backend.
- **State:** URL state for selected base/table/view; local state only for ephemeral UI.
- **Data fetching:** stable query keys, minimal invalidations, no waterfall where avoidable.
- **Mutations:** optimistic UX for cell edit; explicit error toasts/messages; rollback logic.
- **Performance:** avoid rendering whole grid on small edits; memoize selectors; plan/enable row virtualization.
- **Accessibility:** keyboard navigation in grid, focus visibility, semantic controls, proper labels.
- **Resilience:** complete loading/empty/error states for each panel.
- **Testing-ready design:** logic extracted into hooks/utilities with deterministic inputs.
- **Maintainability:** no giant components, no magic strings, clear extension points for future view types.
