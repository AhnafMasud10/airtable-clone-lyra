"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { api } from "~/trpc/react";
import type {
  GridField,
  GridFilter,
  GridSort,
  TableRowModel,
  TableSummary,
  ViewItem,
} from "./types";
import { INITIAL_LOAD_SIZE, PAGE_SIZE } from "./types";
import { TopBar } from "./top-bar";
import { TableTabs } from "./table-tabs";
import { ViewsSidebar } from "./views-sidebar";
import { GridToolbar } from "./grid-toolbar";
import { GridTable } from "./grid-table";
import { RowContextMenu } from "./row-context-menu";
import { ColumnContextMenu } from "./column-context-menu";
import { EditFieldPanel } from "./create-field-panel";

type BaseGridPageClientProps = Readonly<{
  baseId: string;
  baseName: string;
  initialTables: TableSummary[];
  initialTableId: string | null;
  initialViewId: string | null;
}>;

export function BaseGridPageClient({
  baseId,
  baseName,
  initialTables,
  initialTableId,
  initialViewId,
}: BaseGridPageClientProps) {
  const utils = api.useUtils();

  const [selectedTableId, setSelectedTableId] = useState<string | null>(
    initialTableId ?? initialTables[0]?.id ?? null,
  );
  const [selectedViewId, setSelectedViewId] = useState<string | null>(
    initialViewId,
  );
  const [globalSearch, setGlobalSearch] = useState("");
  const [filters, setFilters] = useState<GridFilter[]>([]);
  const [sorts, setSorts] = useState<GridSort[]>([]);
  const [hiddenFieldIds, setHiddenFieldIds] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    fieldId: string;
    value: string;
  } | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchMatchCount, setSearchMatchCount] = useState(0);
  const [activeSearchMatchIndex, setActiveSearchMatchIndex] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    anchorRowId: string;
  } | null>(null);
  const [columnContextMenu, setColumnContextMenu] = useState<{
    x: number;
    y: number;
    field: GridField;
    fieldIndex: number;
  } | null>(null);
  const [editFieldState, setEditFieldState] = useState<{
    field: GridField;
    position: { x: number; y: number };
  } | null>(null);
  const pendingCellUpdatesRef = useRef<
    Map<string, { fieldId: string; value: string }[]>
  >(new Map());
  const upsertCellMutateRef = useRef<
    ((input: { recordId: string; fieldId: string; value: string | null }) => void) | null
  >(null);
  // Guards auto-save from firing during programmatic view/table switches
  const suppressAutoSaveRef = useRef(false);
  // Local source-of-truth for view configs (viewId → config)
  // This avoids stale reads from viewsQuery.data when switching views
  const viewConfigCacheRef = useRef<
    Map<string, { globalSearch: string; filters: GridFilter[]; sorts: GridSort[]; hiddenFieldIds: string[] }>
  >(new Map());
  const [isViewSwitching, setIsViewSwitching] = useState(false);

  // Viewport-based fetching: cache pages fetched on scroll
  const viewportCacheRef = useRef<Map<number, TableRowModel[]>>(new Map());
  const fetchingPagesRef = useRef<Set<number>>(new Set());
  const [viewportCacheVersion, setViewportCacheVersion] = useState(0);

  useEffect(() => {
    setSelectedTableId(initialTableId ?? initialTables[0]?.id ?? null);
  }, [initialTableId, initialTables]);

  useEffect(() => {
    setSelectedViewId(initialViewId);
  }, [initialViewId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("[data-row]") || target.closest("[data-popup]")) return;
      setSelectedRowIds((prev) => (prev.size > 0 ? new Set() : prev));
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveSearchMatchIndex(0);
  }, [globalSearch]);

  const handleSearchMatchesChange = useCallback((count: number) => {
    setSearchMatchCount(count);
    setActiveSearchMatchIndex((prev) => (count > 0 ? Math.min(prev, count - 1) : 0));
  }, []);

  const handlePrevSearchMatch = useCallback(() => {
    setActiveSearchMatchIndex((prev) =>
      searchMatchCount > 0 ? (prev - 1 + searchMatchCount) % searchMatchCount : 0,
    );
  }, [searchMatchCount]);

  const handleNextSearchMatch = useCallback(() => {
    setActiveSearchMatchIndex((prev) =>
      searchMatchCount > 0 ? (prev + 1) % searchMatchCount : 0,
    );
  }, [searchMatchCount]);

  // ── Queries ──────────────────────────────────────────────────────────

  const tablesQuery = api.table.listByBase.useQuery(
    { baseId },
    { initialData: initialTables, staleTime: 30_000 },
  );

  const viewsQuery = api.view.listByTable.useQuery(
    { tableId: selectedTableId ?? "missing-table" },
    { enabled: Boolean(selectedTableId), staleTime: 30_000 },
  );

  const gridInput = useMemo(
    () => ({
      tableId: selectedTableId ?? "missing-table",
      limit: INITIAL_LOAD_SIZE,
      globalSearch,
      filters,
      sorts,
      hiddenFieldIds,
    }),
    [selectedTableId, globalSearch, filters, sorts, hiddenFieldIds],
  );

  const lastRowsInput = useMemo(
    () => ({
      ...gridInput,
      cursor: { fromEnd: true as const },
      limit: INITIAL_LOAD_SIZE,
    }),
    [gridInput],
  );

  const firstPageQuery = api.table.getGridWindow.useQuery(gridInput, {
    enabled: Boolean(selectedTableId),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const serverTotalFromFirstPage = firstPageQuery.data?.total ?? 0;
  const lastRowsQuery = api.table.getGridWindow.useQuery(lastRowsInput, {
    enabled:
      Boolean(selectedTableId) &&
      serverTotalFromFirstPage > INITIAL_LOAD_SIZE &&
      !firstPageQuery.isPlaceholderData,
  });

  // ── Eager prefetch: warm cache for ALL tables on mount ─────────────
  const prefetchedRef = useRef(false);
  useEffect(() => {
    const tables = tablesQuery.data;
    if (!tables || prefetchedRef.current) return;
    prefetchedRef.current = true;
    for (const t of tables) {
      if (t.id === selectedTableId) continue;
      void utils.table.getGridWindow.prefetch({
        tableId: t.id,
        limit: PAGE_SIZE,
        globalSearch: "",
        filters: [],
        sorts: [],
      });
      void utils.view.listByTable.prefetch({ tableId: t.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tablesQuery.data]);

  // ── Mutations ────────────────────────────────────────────────────────

  const [localBaseName, setLocalBaseName] = useState(baseName);

  const updateBase = api.base.update.useMutation({
    onMutate: (input) => {
      if (input.name) setLocalBaseName(input.name);
    },
    onError: () => {
      setLocalBaseName(baseName);
    },
  });

  const handleRenameBase = useCallback(
    (name: string) => {
      updateBase.mutate({ baseId, name });
    },
    [baseId, updateBase],
  );

  const createTable = api.table.createWithDefaults.useMutation({
    onSuccess: async (created) => {
      suppressAutoSaveRef.current = true;
      await utils.table.listByBase.invalidate({ baseId });
      setSelectedTableId(created.id);
      setSelectedViewId(null);
      setFilters([]);
      setSorts([]);
      setGlobalSearch("");
      setHiddenFieldIds([]);
      setShowSearch(false);
      globalThis.history.replaceState(
        null,
        "",
        `/base/${baseId}/table/${created.id}`,
      );
      requestAnimationFrame(() => {
        suppressAutoSaveRef.current = false;
      });
    },
  });

  const seedTable = api.table.seedTable.useMutation({
    onSuccess: async (created) => {
      suppressAutoSaveRef.current = true;
      await utils.table.listByBase.invalidate({ baseId });
      setSelectedTableId(created.id);
      setSelectedViewId(null);
      setFilters([]);
      setSorts([]);
      setGlobalSearch("");
      setHiddenFieldIds([]);
      setShowSearch(false);
      globalThis.history.replaceState(
        null,
        "",
        `/base/${baseId}/table/${created.id}`,
      );
      requestAnimationFrame(() => {
        suppressAutoSaveRef.current = false;
      });
    },
  });

  const updateTable = api.table.update.useMutation({
    onMutate: async (input) => {
      const queryKey = { baseId };
      await utils.table.listByBase.cancel(queryKey);
      const previousTables = utils.table.listByBase.getData(queryKey);
      utils.table.listByBase.setData(queryKey, (old) =>
        old?.map((t) =>
          t.id === input.tableId
            ? { ...t, ...(input.name ? { name: input.name } : {}) }
            : t,
        ),
      );
      return { previousTables };
    },
    onError: (_err, _input, context) => {
      if (context?.previousTables) {
        utils.table.listByBase.setData({ baseId }, context.previousTables);
      }
      // Only refetch on error to restore true server state
      void utils.table.listByBase.invalidate({ baseId });
    },
  });

  const deleteTable = api.table.delete.useMutation({
    onMutate: async (input) => {
      const queryKey = { baseId };
      await utils.table.listByBase.cancel(queryKey);
      const previousTables = utils.table.listByBase.getData(queryKey);
      utils.table.listByBase.setData(queryKey, (old) =>
        old?.filter((t) => t.id !== input.tableId),
      );
      // Switch to another table if the deleted one was selected
      if (selectedTableId === input.tableId) {
        const remaining = (previousTables ?? []).filter((t) => t.id !== input.tableId);
        if (remaining.length > 0) {
          const next = remaining[0]!;
          suppressAutoSaveRef.current = true;
          setSelectedTableId(next.id);
          setSelectedViewId(null);
          setFilters([]);
          setSorts([]);
          setGlobalSearch("");
          setHiddenFieldIds([]);
          globalThis.history.replaceState(null, "", `/base/${baseId}/table/${next.id}`);
          requestAnimationFrame(() => { suppressAutoSaveRef.current = false; });
        }
      }
      return { previousTables };
    },
    onError: (_err, _input, context) => {
      if (context?.previousTables) {
        utils.table.listByBase.setData({ baseId }, context.previousTables);
      }
    },
    onSettled: async () => {
      await utils.table.listByBase.invalidate({ baseId });
    },
  });

  const duplicateTable = api.table.duplicate.useMutation({
    onSuccess: async (created) => {
      suppressAutoSaveRef.current = true;
      await utils.table.listByBase.invalidate({ baseId });
      setSelectedTableId(created.id);
      setSelectedViewId(null);
      setFilters([]);
      setSorts([]);
      setGlobalSearch("");
      setHiddenFieldIds([]);
      globalThis.history.replaceState(null, "", `/base/${baseId}/table/${created.id}`);
      requestAnimationFrame(() => { suppressAutoSaveRef.current = false; });
    },
  });

  const clearTableData = api.table.clearData.useMutation({
    onMutate: async () => {
      if (!selectedTableId) return {};
      await utils.table.getGridWindow.cancel(gridInput);
      const previousGrid = utils.table.getGridWindow.getData(gridInput);
      utils.table.getGridWindow.setData(gridInput, (old) => {
        if (!old) return old;
        return { ...old, rows: [], total: 0 };
      });
      return { previousGrid };
    },
    onError: (_err, _input, context) => {
      if (context?.previousGrid) {
        utils.table.getGridWindow.setData(gridInput, context.previousGrid);
      }
    },
    onSettled: async () => {
      if (!selectedTableId) return;
      viewportCacheRef.current.clear();
      fetchingPagesRef.current.clear();
      await utils.table.getGridWindow.invalidate();
    },
  });

  const bulkInsertRows = api.table.bulkInsertRows.useMutation();
  const [bulkProgress, setBulkProgress] = useState<{
    inserted: number;
    total: number;
  } | null>(null);
  // Snapshot of serverTotal before bulk insert starts, so we can show accurate count
  const preBulkTotalRef = useRef(0);

  const reorderFields = api.field.reorder.useMutation({
    onMutate: async ({ fieldIds }) => {
      const previousGrid = utils.table.getGridWindow.getData(gridInput);
      void utils.table.getGridWindow.cancel(gridInput);

      utils.table.getGridWindow.setData(gridInput, (current) => {
        if (!current) return current;
        const fieldMap = new Map(current.fields.map((f) => [f.id, f]));
        const reorderedFields = fieldIds
          .map((id) => fieldMap.get(id))
          .filter((f): f is NonNullable<typeof f> => Boolean(f));
        return { ...current, fields: reorderedFields };
      });

      return { previousGrid };
    },
    onError: (_error, _input, context) => {
      if (!context?.previousGrid) return;
      utils.table.getGridWindow.setData(gridInput, context.previousGrid);
    },
    onSettled: async () => {
      if (!selectedTableId) return;
      await utils.table.getGridWindow.invalidate();
    },
  });

  const createView = api.view.create.useMutation({
    onSuccess: async (view) => {
      suppressAutoSaveRef.current = true;
      setSelectedViewId(view.id);
      // Apply the new view's config (clean slate)
      applyViewConfig(view);
      if (!selectedTableId) return;
      await utils.view.listByTable.invalidate({ tableId: selectedTableId });
      globalThis.history.replaceState(
        null,
        "",
        `/base/${baseId}/table/${selectedTableId}/view/${view.id}`,
      );
      requestAnimationFrame(() => {
        suppressAutoSaveRef.current = false;
      });
    },
  });

  const updateView = api.view.update.useMutation({
    onMutate: async (input) => {
      if (!selectedTableId) return {};
      const queryKey = { tableId: selectedTableId };
      await utils.view.listByTable.cancel(queryKey);
      const previousViews = utils.view.listByTable.getData(queryKey);
      utils.view.listByTable.setData(queryKey, (old) =>
        old?.map((v) =>
          v.id === input.viewId
            ? { ...v, ...(input.name ? { name: input.name } : {}) }
            : v,
        ),
      );
      return { previousViews };
    },
    onError: (_err, _input, context) => {
      if (!selectedTableId || !context?.previousViews) return;
      utils.view.listByTable.setData({ tableId: selectedTableId }, context.previousViews);
      void utils.view.listByTable.invalidate({ tableId: selectedTableId });
    },
  });

  const deleteView = api.view.delete.useMutation({
    onSuccess: async (_data, variables) => {
      if (!selectedTableId) return;
      await utils.view.listByTable.invalidate({ tableId: selectedTableId });
      // If the deleted view was selected, switch to the first available view
      if (selectedViewId === variables.viewId) {
        const remaining = (viewsQuery.data ?? []).filter((v) => v.id !== variables.viewId);
        if (remaining.length > 0) {
          const next = remaining[0]!;
          setSelectedViewId(next.id);
          applyViewConfig(next);
          globalThis.history.replaceState(
            null,
            "",
            `/base/${baseId}/table/${selectedTableId}/view/${next.id}`,
          );
        }
      }
    },
  });

  const createField = api.field.create.useMutation({
    onMutate: async (input) => {
      if (!selectedTableId) return {};

      const previousGrid = utils.table.getGridWindow.getData(gridInput);
      void utils.table.getGridWindow.cancel(gridInput);

      const optimisticField = {
        id: `optimistic-field-${Date.now()}`,
        name: input.name,
        type: input.type ?? "TEXT",
        order: input.order ?? 0,
        tableId: selectedTableId,
      };

      utils.table.getGridWindow.setData(gridInput, (current) => {
        if (!current) return current;
        const newFields = [...current.fields, optimisticField];
        const newRows = current.rows.map((row) => ({
          ...row,
          cells: [
            ...row.cells,
            {
              id: `optimistic-${row.id}-${optimisticField.id}`,
              recordId: row.id,
              fieldId: optimisticField.id,
              value: "",
            },
          ],
        }));
        return { ...current, fields: newFields, rows: newRows };
      });

      return { previousGrid };
    },
    onError: (_error, _input, context) => {
      if (!context?.previousGrid) return;
      utils.table.getGridWindow.setData(gridInput, context.previousGrid);
    },
    onSettled: async () => {
      if (!selectedTableId) return;
      viewportCacheRef.current.clear();
      fetchingPagesRef.current.clear();
      await utils.table.getGridWindow.invalidate();
    },
  });

  const deleteField = api.field.delete.useMutation({
    onSuccess: async () => {
      if (!selectedTableId) return;
      viewportCacheRef.current.clear();
      fetchingPagesRef.current.clear();
      await utils.table.getGridWindow.invalidate();
    },
  });

  const updateField = api.field.update.useMutation({
    onMutate: async (input) => {
      const previousGrid = utils.table.getGridWindow.getData(gridInput);
      void utils.table.getGridWindow.cancel(gridInput);

      utils.table.getGridWindow.setData(gridInput, (current) => {
        if (!current) return current;
        return {
          ...current,
          fields: current.fields.map((f) =>
            f.id === input.fieldId
              ? { ...f, ...(input.name ? { name: input.name } : {}), ...(input.type ? { type: input.type } : {}) }
              : f,
          ),
        };
      });

      return { previousGrid };
    },
    onError: (_error, _input, context) => {
      if (!context?.previousGrid) return;
      utils.table.getGridWindow.setData(gridInput, context.previousGrid);
    },
    onSettled: async () => {
      if (!selectedTableId) return;
      await utils.table.getGridWindow.invalidate();
    },
  });

  const createRecord = api.record.create.useMutation({
    onMutate: async (input) => {
      if (!selectedTableId) return {};

      const previousGrid = utils.table.getGridWindow.getData(gridInput);
      void utils.table.getGridWindow.cancel(gridInput);

      const tempId = `optimistic-row-${Date.now()}`;
      utils.table.getGridWindow.setData(gridInput, (current) => {
        if (!current) return current;
        const optimisticRow = {
          id: tempId,
          order: input.order ?? 0,
          tableId: selectedTableId,
          cells: current.fields.map((f) => ({
            id: `optimistic-${tempId}-${f.id}`,
            recordId: tempId,
            fieldId: f.id,
            value: null as string | null,
          })),
        };

        return {
          ...current,
          rows: [...current.rows, optimisticRow],
          total: (current.total ?? 0) + 1,
        };
      });

      return { previousGrid, tempId, order: input.order ?? 0 };
    },
    onSuccess: (createdRecord, _input, context) => {
      if (!context?.tempId) return;

      const pending = pendingCellUpdatesRef.current.get(context.tempId);
      pendingCellUpdatesRef.current.delete(context.tempId);

      const cellsToPersist = pending ?? [];

      utils.table.getGridWindow.setData(gridInput, (current) => {
        if (!current) return current;
        const optimisticRow = current.rows.find((r) => r.id === context.tempId);
        if (!optimisticRow) return current;

        const mergedCells = optimisticRow.cells.map((c) => {
          const pendingUpdate = pending?.find((p) => p.fieldId === c.fieldId);
          const value = pendingUpdate?.value ?? c.value;
          return {
            id: `cell-${createdRecord.id}-${c.fieldId}`,
            recordId: createdRecord.id,
            fieldId: c.fieldId,
            value,
          };
        });

        const realRow = {
          ...createdRecord,
          cells: mergedCells,
        };

        return {
          ...current,
          rows: current.rows.map((r) =>
            r.id === context.tempId ? realRow : r,
          ),
        };
      });

      for (const { fieldId, value } of cellsToPersist) {
        upsertCellMutateRef.current?.({
          recordId: createdRecord.id,
          fieldId,
          value: value || null,
        });
      }
    },
    onError: (_error, _input, context) => {
      if (!context?.previousGrid) return;
      utils.table.getGridWindow.setData(gridInput, context.previousGrid);
      if (context?.tempId) {
        pendingCellUpdatesRef.current.delete(context.tempId);
      }
    },
    onSettled: async (_data, error) => {
      if (error && selectedTableId) {
        await utils.table.getGridWindow.invalidate();
      }
    },
  });

  const upsertCell = api.cell.upsert.useMutation({
    onMutate: async (input) => {
      if (!selectedTableId) return {};

      const previousGrid = utils.table.getGridWindow.getData(gridInput);
      void utils.table.getGridWindow.cancel(gridInput);

      utils.table.getGridWindow.setData(gridInput, (current) => {
        if (!current) return current;
        return {
          ...current,
          rows: current.rows.map((row) => {
            if (row.id !== input.recordId) return row;

            const existingCellIndex = row.cells.findIndex(
              (cell) => cell.fieldId === input.fieldId,
            );
            if (existingCellIndex === -1) {
              return {
                ...row,
                cells: [
                  ...row.cells,
                  {
                    id: `optimistic-${input.recordId}-${input.fieldId}`,
                    recordId: input.recordId,
                    fieldId: input.fieldId,
                    value: input.value,
                  },
                ],
              };
            }

            const nextCells = [...row.cells];
            const currentCell = nextCells[existingCellIndex];
            if (!currentCell) return row;
            nextCells[existingCellIndex] = {
              ...currentCell,
              value: input.value,
            };
            return { ...row, cells: nextCells };
          }),
        };
      });

      return { previousGrid };
    },
    onSuccess: (serverCell) => {
      utils.table.getGridWindow.setData(gridInput, (current) => {
        if (!current) return current;
        return {
          ...current,
          rows: current.rows.map((row) => {
            if (row.id !== serverCell.recordId) return row;

            const idx = row.cells.findIndex(
              (c) => c.fieldId === serverCell.fieldId,
            );
            if (idx === -1) {
              return {
                ...row,
                cells: [...row.cells, serverCell],
              };
            }

            const next = [...row.cells];
            next[idx] = serverCell;
            return { ...row, cells: next };
          }),
        };
      });
    },
    onError: (_error, _input, context) => {
      if (!context?.previousGrid) return;
      utils.table.getGridWindow.setData(gridInput, context.previousGrid);
      void utils.table.getGridWindow.invalidate();
    },
  });

  upsertCellMutateRef.current = upsertCell.mutate;

  const duplicateRecord = api.record.duplicate.useMutation({
    onSuccess: async () => {
      if (!selectedTableId) return;
      await utils.table.getGridWindow.invalidate(gridInput);
      setSelectedRowIds(new Set());
    },
  });

  const bulkDeleteRecords = api.record.bulkDelete.useMutation({
    onMutate: async (input) => {
      const previousGrid = utils.table.getGridWindow.getData(gridInput);
      void utils.table.getGridWindow.cancel(gridInput);

      const idSet = new Set(input.recordIds);
      utils.table.getGridWindow.setData(gridInput, (current) => {
        if (!current) return current;
        const removedCount = current.rows.filter((row) => idSet.has(row.id)).length;
        return {
          ...current,
          rows: current.rows.filter((row) => !idSet.has(row.id)),
          total: current.total - removedCount,
        };
      });

      return { previousGrid };
    },
    onError: (_error, _input, context) => {
      if (!context?.previousGrid) return;
      utils.table.getGridWindow.setData(gridInput, context.previousGrid);
    },
    onSettled: async () => {
      if (!selectedTableId) return;
      viewportCacheRef.current.clear();
      fetchingPagesRef.current.clear();
      await utils.table.getGridWindow.invalidate();
      setSelectedRowIds(new Set());
    },
  });

  // ── Auto-select first view when views load ──────────────────────────

  useEffect(() => {
    if (!viewsQuery.data || viewsQuery.data.length === 0) return;
    // Seed cache from server data for any views not yet locally cached
    for (const v of viewsQuery.data) {
      if (!viewConfigCacheRef.current.has(v.id)) {
        const cfg =
          v.config && typeof v.config === "object"
            ? (v.config as {
                globalSearch?: string;
                filters?: GridFilter[];
                sorts?: GridSort[];
                hiddenFieldIds?: string[];
              })
            : {};
        viewConfigCacheRef.current.set(v.id, {
          globalSearch: cfg.globalSearch ?? "",
          filters: cfg.filters ?? [],
          sorts: cfg.sorts ?? [],
          hiddenFieldIds: cfg.hiddenFieldIds ?? [],
        });
      }
    }
    // If no view is selected (or selected view doesn't exist in list), pick the first
    const viewExists = viewsQuery.data.some((v) => v.id === selectedViewId);
    if (!viewExists) {
      const first = viewsQuery.data[0]!;
      suppressAutoSaveRef.current = true;
      setSelectedViewId(first.id);
      // Apply from local cache (just seeded above)
      const cached = viewConfigCacheRef.current.get(first.id);
      if (cached) {
        setGlobalSearch(cached.globalSearch);
        setFilters(cached.filters);
        setSorts(cached.sorts);
        setHiddenFieldIds(cached.hiddenFieldIds);
        setShowSearch(Boolean(cached.globalSearch));
      } else {
        applyViewConfig(first);
      }
      if (selectedTableId) {
        globalThis.history.replaceState(
          null,
          "",
          `/base/${baseId}/table/${selectedTableId}/view/${first.id}`,
        );
      }
      // Allow auto-save after React commits the batched state
      requestAnimationFrame(() => {
        suppressAutoSaveRef.current = false;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewsQuery.data]);

  // ── Auto-save view config (debounced, per-view) ────────────────────

  const saveViewConfig = api.view.saveConfig.useMutation();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!selectedViewId || suppressAutoSaveRef.current) return;
    // Always keep the local cache in sync with the current config
    const currentConfig = { globalSearch, filters, sorts, hiddenFieldIds };
    viewConfigCacheRef.current.set(selectedViewId, currentConfig);
    // Debounce: save 500ms after the last user-driven change
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (suppressAutoSaveRef.current) return;
      saveViewConfig.mutate({
        viewId: selectedViewId,
        config: currentConfig,
      });
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedViewId, globalSearch, filters, sorts, hiddenFieldIds]);

  // ── Clear view-switching spinner once fresh data arrives ─────────────
  useEffect(() => {
    if (isViewSwitching && !firstPageQuery.isFetching) {
      setIsViewSwitching(false);
    }
  }, [isViewSwitching, firstPageQuery.isFetching]);

  // ── Clear viewport cache when query inputs change ──────────────────
  const prevGridInputRef = useRef(gridInput);
  useEffect(() => {
    if (prevGridInputRef.current !== gridInput) {
      prevGridInputRef.current = gridInput;
      viewportCacheRef.current.clear();
      fetchingPagesRef.current.clear();
      setViewportCacheVersion(0);
    }
  }, [gridInput]);

  // ── Derived data ─────────────────────────────────────────────────────

  const allFieldsFromGrid: GridField[] = useMemo(
    () => firstPageQuery.data?.fields ?? [],
    [firstPageQuery.data],
  );
  const fields: GridField[] = allFieldsFromGrid.filter(
    (f) => !hiddenFieldIds.includes(f.id),
  );
  const serverTotal = firstPageQuery.data?.total ?? 0;

  // During bulk insert, show the final target total so the scrollbar
  // extends to full height immediately (enables scroll-to-bottom).
  const totalCount = bulkProgress
    ? Math.max(serverTotal, preBulkTotalRef.current + bulkProgress.total)
    : serverTotal;

  // Build sparse Map<rowIndex, TableRowModel> from first page + last page + viewport cache
  const rowLookup = useMemo(() => {
    const map = new Map<number, TableRowModel>();

    // First page rows (offset 0)
    const firstRows = firstPageQuery.data?.rows ?? [];
    for (let i = 0; i < firstRows.length; i++) {
      const row = firstRows[i]!;
      map.set(i, {
        id: row.id,
        order: row.order,
        cellsByField: Object.fromEntries(
          row.cells.map((cell) => [cell.fieldId, cell.value ?? ""]),
        ),
      });
    }

    // Last page rows (from end)
    const lastRows = lastRowsQuery.data?.rows ?? [];
    if (lastRows.length > 0 && serverTotal > 0) {
      const lastPageStart = serverTotal - lastRows.length;
      for (let i = 0; i < lastRows.length; i++) {
        const row = lastRows[i]!;
        const idx = lastPageStart + i;
        if (!map.has(idx)) {
          map.set(idx, {
            id: row.id,
            order: row.order,
            cellsByField: Object.fromEntries(
              row.cells.map((cell) => [cell.fieldId, cell.value ?? ""]),
            ),
          });
        }
      }
    }

    // Viewport-cached pages
    for (const [offset, models] of viewportCacheRef.current) {
      for (let i = 0; i < models.length; i++) {
        const idx = offset + i;
        if (!map.has(idx)) {
          map.set(idx, models[i]!);
        }
      }
    }

    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstPageQuery.data, lastRowsQuery.data, serverTotal, viewportCacheVersion]);

  // Set of field IDs that have an active (complete) filter applied
  const filteredFieldIds = useMemo(() => {
    const isComplete = (f: GridFilter) =>
      f.op === "is_empty" ||
      f.op === "is_not_empty" ||
      (f.value !== undefined && String(f.value) !== "");
    return new Set(filters.filter(isComplete).map((f) => f.fieldId));
  }, [filters]);

  const selectedTableName =
    (tablesQuery.data ?? []).find((t) => t.id === selectedTableId)?.name ??
    "Untitled table";

  const selectedViewName =
    (viewsQuery.data ?? []).find((v) => v.id === selectedViewId)?.name ??
    "Grid view";

  // ── Callbacks ────────────────────────────────────────────────────────

  const applyViewConfig = useCallback((view: ViewItem | null) => {
    const config =
      view?.config && typeof view.config === "object"
        ? (view.config as {
            globalSearch?: string;
            filters?: GridFilter[];
            sorts?: GridSort[];
            hiddenFieldIds?: string[];
          })
        : {};
    setGlobalSearch(config.globalSearch ?? "");
    setFilters(config.filters ?? []);
    setSorts(config.sorts ?? []);
    setHiddenFieldIds(config.hiddenFieldIds ?? []);
    setShowSearch(Boolean(config.globalSearch));
  }, []);

  const handleSelectTable = useCallback(
    (tableId: string) => {
      suppressAutoSaveRef.current = true;
      viewConfigCacheRef.current.clear();
      viewportCacheRef.current.clear();
      fetchingPagesRef.current.clear();
      setSelectedTableId(tableId);
      setSelectedViewId(null);
      setFilters([]);
      setSorts([]);
      setGlobalSearch("");
      setHiddenFieldIds([]);
      setShowSearch(false);
      globalThis.history.replaceState(
        null,
        "",
        `/base/${baseId}/table/${tableId}`,
      );
      requestAnimationFrame(() => {
        suppressAutoSaveRef.current = false;
      });
    },
    [baseId],
  );

  const handlePrefetchTable = useCallback(
    (tableId: string) => {
      if (tableId === selectedTableId) return;
      void utils.table.getGridWindow.prefetch({
        tableId,
        limit: PAGE_SIZE,
        globalSearch: "",
        filters: [],
        sorts: [],
      });
      void utils.view.listByTable.prefetch({ tableId });
    },
    [selectedTableId, utils],
  );

  const handleAddTable = useCallback(() => {
    const tables = tablesQuery.data ?? [];
    const existingNames = new Set(tables.map((t) => t.name));
    let name = "Table 1";
    let i = 2;
    while (existingNames.has(name)) {
      name = `Table ${i}`;
      i++;
    }
    createTable.mutate({ baseId, name, defaultRowCount: 0 });
  }, [baseId, createTable, tablesQuery.data]);

  const handleSeedTable = useCallback(() => {
    const tables = tablesQuery.data ?? [];
    const existingNames = new Set(tables.map((t) => t.name));
    let name = "Seeded Table 1";
    let i = 2;
    while (existingNames.has(name)) {
      name = `Seeded Table ${i}`;
      i++;
    }
    seedTable.mutate({ baseId, name });
  }, [baseId, seedTable, tablesQuery.data]);

  const handleRenameTable = useCallback(
    (tableId: string, name: string) => {
      updateTable.mutate({ tableId, name });
    },
    [updateTable],
  );

  const handleDuplicateTable = useCallback(
    (tableId: string) => {
      const tables = tablesQuery.data ?? [];
      const source = tables.find((t) => t.id === tableId);
      const baseName = source ? `${source.name} copy` : "Table copy";
      const existingNames = new Set(tables.map((t) => t.name));
      let name = baseName;
      let i = 2;
      while (existingNames.has(name)) {
        name = `${baseName} ${i}`;
        i++;
      }
      duplicateTable.mutate({ tableId, name });
    },
    [duplicateTable, tablesQuery.data],
  );

  const handleDeleteTable = useCallback(
    (tableId: string) => {
      deleteTable.mutate({ tableId });
    },
    [deleteTable],
  );

  const handleClearTableData = useCallback(
    (tableId: string) => {
      clearTableData.mutate({ tableId });
    },
    [clearTableData],
  );


  const handleBulkInsert = useCallback(async () => {
    if (!selectedTableId || bulkProgress) return;
    const TOTAL = 100000;
    const BATCH = 10000;
    const CONCURRENCY = 3;

    preBulkTotalRef.current = serverTotal;
    setBulkProgress({ inserted: 0, total: TOTAL });

    try {
      // First batch: let server compute startOrder
      const first = await bulkInsertRows.mutateAsync({
        tableId: selectedTableId,
        count: BATCH,
      });
      let inserted = first.inserted;
      let nextStartOrder = (first.startOrder ?? 0) + first.inserted;
      setBulkProgress({ inserted, total: TOTAL });

      // Concurrent batches — no mid-loop invalidation to avoid stack overflow
      while (inserted < TOTAL) {
        const remaining = TOTAL - inserted;
        const batchCount = Math.min(CONCURRENCY, Math.ceil(remaining / BATCH));

        const results = await Promise.allSettled(
          Array.from({ length: batchCount }, (_, i) => {
            const count = Math.min(BATCH, TOTAL - (inserted + i * BATCH));
            if (count <= 0) return Promise.resolve({ inserted: 0, startOrder: 0 });
            return bulkInsertRows.mutateAsync({
              tableId: selectedTableId,
              count,
              startOrder: nextStartOrder + i * BATCH,
            });
          }),
        );

        let added = 0;
        for (const r of results) {
          if (r.status === "fulfilled") added += r.value.inserted;
        }
        inserted += added;
        nextStartOrder += added;
        setBulkProgress({ inserted, total: TOTAL });

        if (added === 0) break;
      }
    } catch (err) {
      console.error("Bulk insert error:", err);
    } finally {
      setBulkProgress(null);
      viewportCacheRef.current.clear();
      fetchingPagesRef.current.clear();
      await utils.table.getGridWindow.invalidate();
    }
  }, [selectedTableId, bulkProgress, bulkInsertRows, utils, serverTotal]);

  const handleCreateView = useCallback(
    (type: string, name: string) => {
      if (!selectedTableId) return;
      createView.mutate({
        tableId: selectedTableId,
        name,
        type: type as "GRID" | "KANBAN" | "CALENDAR" | "GALLERY" | "FORM",
        config: { globalSearch: "", filters: [], sorts: [], hiddenFieldIds: [] },
      });
    },
    [selectedTableId, createView],
  );

  const handleRenameView = useCallback(
    (viewId: string, name: string) => {
      updateView.mutate({ viewId, name });
    },
    [updateView],
  );

  const handleDuplicateView = useCallback(
    (view: ViewItem) => {
      if (!selectedTableId) return;
      createView.mutate({
        tableId: selectedTableId,
        name: `${view.name} copy`,
        type: view.type,
        config: view.config ?? { globalSearch: "", filters: [], sorts: [], hiddenFieldIds: [] },
      });
    },
    [selectedTableId, createView],
  );

  const handleDeleteView = useCallback(
    (viewId: string) => {
      deleteView.mutate({ viewId });
    },
    [deleteView],
  );

  const handleSelectView = useCallback(
    (view: ViewItem) => {
      if (!selectedTableId) return;
      // Flush any pending save for the current view before switching
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
        if (selectedViewId) {
          const cached = viewConfigCacheRef.current.get(selectedViewId);
          if (cached) {
            saveViewConfig.mutate({ viewId: selectedViewId, config: cached });
          }
        }
      }
      // Suppress auto-save so we don't write old state into the newly selected view
      suppressAutoSaveRef.current = true;
      setIsViewSwitching(true);
      setSelectedViewId(view.id);

      // Read from local cache first, fall back to server data
      const cached = viewConfigCacheRef.current.get(view.id);
      if (cached) {
        setGlobalSearch(cached.globalSearch);
        setFilters(cached.filters);
        setSorts(cached.sorts);
        setHiddenFieldIds(cached.hiddenFieldIds);
        setShowSearch(Boolean(cached.globalSearch));
      } else {
        applyViewConfig(view);
        // Seed the cache from server data
        const config =
          view.config && typeof view.config === "object"
            ? (view.config as {
                globalSearch?: string;
                filters?: GridFilter[];
                sorts?: GridSort[];
                hiddenFieldIds?: string[];
              })
            : {};
        viewConfigCacheRef.current.set(view.id, {
          globalSearch: config.globalSearch ?? "",
          filters: config.filters ?? [],
          sorts: config.sorts ?? [],
          hiddenFieldIds: config.hiddenFieldIds ?? [],
        });
      }

      globalThis.history.replaceState(
        null,
        "",
        `/base/${baseId}/table/${selectedTableId}/view/${view.id}`,
      );
      // Re-enable after React commits the batched state
      requestAnimationFrame(() => {
        suppressAutoSaveRef.current = false;
      });
    },
    [applyViewConfig, baseId, selectedTableId, selectedViewId, saveViewConfig],
  );

  const handleCreateField = useCallback(
    (
      name: string,
      type: "TEXT" | "LONG_TEXT" | "NUMBER",
      options?: Record<string, unknown>,
    ) => {
      if (!selectedTableId) return;
      const existingNames = new Set(allFieldsFromGrid.map((f) => f.name));
      let finalName = name;
      let n = 2;
      while (existingNames.has(finalName)) {
        finalName = `${name} ${n}`;
        n++;
      }
      createField.mutate({
        tableId: selectedTableId,
        name: finalName,
        type,
        order: allFieldsFromGrid.length,
        options: options ?? undefined,
      });
    },
    [selectedTableId, createField, allFieldsFromGrid],
  );

  const handleReorderFields = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!selectedTableId) return;
      // fromIndex/toIndex are indices into the visible `fields` array
      const visibleReordered = [...fields];
      const [moved] = visibleReordered.splice(fromIndex, 1);
      if (!moved) return;
      visibleReordered.splice(toIndex, 0, moved);

      // Merge back: visible fields in their new order, hidden fields appended at the end
      const visibleIds = new Set(visibleReordered.map((f) => f.id));
      const hiddenFields = allFieldsFromGrid.filter((f) => !visibleIds.has(f.id));
      const fullReordered = [...visibleReordered, ...hiddenFields];

      reorderFields.mutate({
        tableId: selectedTableId,
        fieldIds: fullReordered.map((f) => f.id),
      });
    },
    [selectedTableId, fields, allFieldsFromGrid, reorderFields],
  );

  const handleAddRow = useCallback(() => {
    if (!selectedTableId) return;
    createRecord.mutate({ tableId: selectedTableId, order: totalCount });
  }, [selectedTableId, createRecord, totalCount]);

  const handleRowContextMenu = useCallback(
    (e: React.MouseEvent, rowId: string) => {
      setColumnContextMenu(null);
      setSelectedRowIds((prev) => {
        const next = new Set(prev);
        if (!next.has(rowId)) next.add(rowId);
        return next;
      });
      setContextMenu({ x: e.clientX, y: e.clientY, anchorRowId: rowId });
    },
    [],
  );

  const handleColumnContextMenu = useCallback(
    (e: { clientX: number; clientY: number; preventDefault?: () => void }, field: GridField, fieldIndex: number) => {
      e.preventDefault?.();
      setContextMenu(null);
      setColumnContextMenu({ x: e.clientX, y: e.clientY, field, fieldIndex });
    },
    [],
  );

  const handleEditField = useCallback(
    (fieldId: string) => {
      const field = allFieldsFromGrid.find((f) => f.id === fieldId);
      if (!field) return;
      const pos = columnContextMenu
        ? { x: columnContextMenu.x, y: columnContextMenu.y }
        : { x: window.innerWidth / 2, y: 200 };
      setColumnContextMenu(null);
      setEditFieldState({ field, position: pos });
    },
    [allFieldsFromGrid, columnContextMenu],
  );

  const handleDuplicateField = useCallback(
    async (fieldId: string) => {
      if (!selectedTableId) return;
      const field = allFieldsFromGrid.find((f) => f.id === fieldId);
      if (!field) return;
      const existingNames = new Set(allFieldsFromGrid.map((f) => f.name));
      let name = `${field.name} (copy)`;
      let n = 1;
      while (existingNames.has(name)) {
        name = `${field.name} (copy ${++n})`;
      }
      await createField.mutateAsync({
        tableId: selectedTableId,
        name,
        type: field.type,
        order: allFieldsFromGrid.length,
      });
      setColumnContextMenu(null);
    },
    [selectedTableId, allFieldsFromGrid, createField],
  );

  const handleInsertLeft = useCallback(
    async (fieldIndex: number) => {
      if (!selectedTableId) return;
      const newField = await createField.mutateAsync({
        tableId: selectedTableId,
        name: "New field",
        type: "TEXT",
        order: 0,
      });
      const currentIds = allFieldsFromGrid.map((f) => f.id);
      const newOrder = [
        ...currentIds.slice(0, fieldIndex),
        newField.id,
        ...currentIds.slice(fieldIndex),
      ];
      reorderFields.mutate({ tableId: selectedTableId, fieldIds: newOrder });
      setColumnContextMenu(null);
    },
    [selectedTableId, allFieldsFromGrid, createField, reorderFields],
  );

  const handleInsertRight = useCallback(
    async (fieldIndex: number) => {
      if (!selectedTableId) return;
      const newField = await createField.mutateAsync({
        tableId: selectedTableId,
        name: "New field",
        type: "TEXT",
        order: 0,
      });
      const currentIds = allFieldsFromGrid.map((f) => f.id);
      const newOrder = [
        ...currentIds.slice(0, fieldIndex + 1),
        newField.id,
        ...currentIds.slice(fieldIndex + 1),
      ];
      reorderFields.mutate({ tableId: selectedTableId, fieldIds: newOrder });
      setColumnContextMenu(null);
    },
    [selectedTableId, allFieldsFromGrid, createField, reorderFields],
  );

  const handleCopyFieldUrl = useCallback((fieldId: string) => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/base/${baseId}/field/${fieldId}`;
    void navigator.clipboard.writeText(url);
    setColumnContextMenu(null);
  }, [baseId]);

  const handleEditFieldDescription = useCallback((_fieldId: string) => {
    setColumnContextMenu(null);
    // TODO: Open edit description modal
  }, []);

  const handleSortAscending = useCallback(
    (fieldId: string) => {
      const field = allFieldsFromGrid.find((f) => f.id === fieldId);
      const type = field?.type === "NUMBER" ? "number" : "text";
      setSorts((prev) => [
        ...prev.filter((f) => f.fieldId !== fieldId),
        { fieldId, direction: "asc" as const, type },
      ]);
      setColumnContextMenu(null);
    },
    [allFieldsFromGrid],
  );

  const handleSortDescending = useCallback(
    (fieldId: string) => {
      const field = allFieldsFromGrid.find((f) => f.id === fieldId);
      const type = field?.type === "NUMBER" ? "number" : "text";
      setSorts((prev) => [
        ...prev.filter((f) => f.fieldId !== fieldId),
        { fieldId, direction: "desc" as const, type },
      ]);
      setColumnContextMenu(null);
    },
    [allFieldsFromGrid],
  );

  const handleFilterByField = useCallback((fieldId: string) => {
    const field = allFieldsFromGrid.find((f) => f.id === fieldId);
    const type = field?.type === "NUMBER" ? "number" : "text";
    setFilters((prev) => [
      ...prev,
      type === "number"
        ? {
            fieldId,
            type: "number" as const,
            op: "is_not_empty" as const,
            conjunction: "and" as const,
          }
        : {
            fieldId,
            type: "text" as const,
            op: "is_not_empty" as const,
            conjunction: "and" as const,
          },
    ]);
    setColumnContextMenu(null);
  }, [allFieldsFromGrid]);

  const handleGroupByField = useCallback((_fieldId: string) => {
    setColumnContextMenu(null);
    // TODO: Group by field
  }, []);

  const handleHideField = useCallback((fieldId: string) => {
    setHiddenFieldIds((prev) =>
      prev.includes(fieldId) ? prev : [...prev, fieldId],
    );
    setColumnContextMenu(null);
  }, []);

  const handleDeleteField = useCallback(
    (fieldId: string) => {
      deleteField.mutate({ fieldId });
      setColumnContextMenu(null);
    },
    [deleteField],
  );

  const insertAboveRecord = api.record.insertAbove.useMutation({
    onSuccess: async () => {
      if (!selectedTableId) return;
      await utils.table.getGridWindow.invalidate(gridInput);
      setSelectedRowIds(new Set());
    },
  });

  const insertBelowRecord = api.record.insertBelow.useMutation({
    onSuccess: async () => {
      if (!selectedTableId) return;
      await utils.table.getGridWindow.invalidate(gridInput);
      setSelectedRowIds(new Set());
    },
  });

  const handleInsertAbove = useCallback(
    (recordId: string) => {
      if (!selectedTableId || recordId.startsWith("optimistic-row-")) return;
      insertAboveRecord.mutate({ tableId: selectedTableId, recordId });
      setContextMenu(null);
    },
    [selectedTableId, insertAboveRecord],
  );

  const handleInsertBelow = useCallback(
    (recordId: string) => {
      if (!selectedTableId || recordId.startsWith("optimistic-row-")) return;
      insertBelowRecord.mutate({ tableId: selectedTableId, recordId });
      setContextMenu(null);
    },
    [selectedTableId, insertBelowRecord],
  );

  const handleDuplicateRecord = useCallback(
    (recordId: string) => {
      duplicateRecord.mutate({ recordId });
      setContextMenu(null);
    },
    [duplicateRecord],
  );

  const handleCopyRecordUrl = useCallback(
    (recordId: string) => {
      const url = `${typeof window !== "undefined" ? window.location.origin : ""}/base/${baseId}/record/${recordId}`;
      void navigator.clipboard.writeText(url);
      setContextMenu(null);
    },
    [baseId],
  );

  const handleStartEdit = useCallback(
    (rowId: string, fieldId: string, value: string) => {
      setEditingCell({ rowId, fieldId, value });
    },
    [],
  );

  const handleChangeEdit = useCallback((value: string) => {
    setEditingCell((prev) => (prev ? { ...prev, value } : prev));
  }, []);

  const handleCommitEdit = useCallback(() => {
    if (!editingCell) return;

    const isOptimisticRow = editingCell.rowId.startsWith("optimistic-row-");
    if (isOptimisticRow) {
      const pending = pendingCellUpdatesRef.current.get(editingCell.rowId) ?? [];
      if (!pending.some((p) => p.fieldId === editingCell.fieldId)) {
        pending.push({ fieldId: editingCell.fieldId, value: editingCell.value });
      } else {
        const idx = pending.findIndex((p) => p.fieldId === editingCell.fieldId);
        pending[idx] = { fieldId: editingCell.fieldId, value: editingCell.value };
      }
      pendingCellUpdatesRef.current.set(editingCell.rowId, pending);

      utils.table.getGridWindow.setData(gridInput, (current) => {
        if (!current) return current;
        return {
          ...current,
          rows: current.rows.map((row) => {
            if (row.id !== editingCell.rowId) return row;
            const existingIdx = row.cells.findIndex(
              (c) => c.fieldId === editingCell.fieldId,
            );
            const nextCells =
              existingIdx >= 0
                ? row.cells.map((c, i) =>
                    i === existingIdx
                      ? { ...c, value: editingCell.value }
                      : c,
                  )
                : [
                    ...row.cells,
                    {
                      id: `optimistic-${editingCell.rowId}-${editingCell.fieldId}`,
                      recordId: editingCell.rowId,
                      fieldId: editingCell.fieldId,
                      value: editingCell.value,
                    },
                  ];
            return { ...row, cells: nextCells };
          }),
        };
      });
    } else {
      upsertCell.mutate({
        recordId: editingCell.rowId,
        fieldId: editingCell.fieldId,
        value: editingCell.value,
      });
    }
    setEditingCell(null);
  }, [editingCell, upsertCell, utils, gridInput]);

  const handleCancelEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleToggleRow = useCallback((rowId: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  }, []);

  const handleToggleAll = useCallback((allIds: string[]) => {
    setSelectedRowIds((prev) => {
      const allSelected = allIds.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(allIds);
    });
  }, []);

  const handleDeleteSelected = useCallback(() => {
    const ids = Array.from(selectedRowIds);
    if (ids.length === 0) return;
    bulkDeleteRecords.mutate({ recordIds: ids });
  }, [selectedRowIds, bulkDeleteRecords]);

  const handleRetry = useCallback(() => {
    firstPageQuery.refetch().catch(() => null);
  }, [firstPageQuery]);

  // Viewport-based fetching: when visible range changes, fetch missing pages
  const handleVisibleRangeChange = useCallback(
    (start: number, end: number) => {
      if (!selectedTableId) return;
      const firstPageEnd = firstPageQuery.data?.rows.length ?? 0;
      const lastPageLen = lastRowsQuery.data?.rows.length ?? 0;
      const lastPageStart = lastPageLen > 0 ? serverTotal - lastPageLen : serverTotal;

      // Compute which PAGE_SIZE-aligned pages cover the visible range
      const startPage = Math.floor(start / PAGE_SIZE) * PAGE_SIZE;
      const endPage = Math.floor(end / PAGE_SIZE) * PAGE_SIZE;

      for (let offset = startPage; offset <= endPage; offset += PAGE_SIZE) {
        // Skip if fully covered by first page or last page
        if (offset + PAGE_SIZE <= firstPageEnd) continue;
        if (offset >= lastPageStart && lastPageLen > 0) continue;
        // Skip if already fetched or in-flight
        if (fetchingPagesRef.current.has(offset)) continue;
        if (viewportCacheRef.current.has(offset)) continue;

        fetchingPagesRef.current.add(offset);

        void utils.table.getGridWindow
          .fetch({
            tableId: selectedTableId,
            cursor: offset,
            limit: PAGE_SIZE,
            globalSearch,
            filters,
            sorts,
            hiddenFieldIds,
          })
          .then((data) => {
            const models: TableRowModel[] = data.rows.map((row) => ({
              id: row.id,
              order: row.order,
              cellsByField: Object.fromEntries(
                row.cells.map((cell) => [cell.fieldId, cell.value ?? ""]),
              ),
            }));
            viewportCacheRef.current.set(offset, models);
            setViewportCacheVersion((v) => v + 1);
          })
          .catch(() => {
            // Allow retry on next scroll
            fetchingPagesRef.current.delete(offset);
          });
      }
    },
    [
      selectedTableId,
      firstPageQuery.data,
      lastRowsQuery.data,
      serverTotal,
      globalSearch,
      filters,
      sorts,
      hiddenFieldIds,
      utils,
    ],
  );

  const handleToggleField = useCallback((fieldId: string) => {
    setHiddenFieldIds((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId],
    );
  }, []);

  const handleHideAll = useCallback(() => {
    setHiddenFieldIds(allFieldsFromGrid.map((f) => f.id));
  }, [allFieldsFromGrid]);

  const handleShowAll = useCallback(() => {
    setHiddenFieldIds([]);
  }, []);

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-white text-[rgb(29,31,37)]">
      {/* ── Icon rail (56px, full height, left edge) ── */}
      <aside className="flex w-14 shrink-0 flex-col items-center justify-between border-r border-black/10 bg-white py-4">
        <div className="flex flex-col items-center gap-4">
          {/* Home / Airtable logo */}
          <button
            type="button"
            className="flex h-6 w-6 items-center justify-center rounded-full"
          >
            <svg
              width="24"
              height="20.4"
              viewBox="0 0 200 170"
              className="flex-none"
              style={{ shapeRendering: "geometricPrecision" }}
            >
              <g>
                <path
                  fill="currentColor"
                  d="M90.0389,12.3675 L24.0799,39.6605 C20.4119,41.1785 20.4499,46.3885 24.1409,47.8515 L90.3759,74.1175 C96.1959,76.4255 102.6769,76.4255 108.4959,74.1175 L174.7319,47.8515 C178.4219,46.3885 178.4609,41.1785 174.7919,39.6605 L108.8339,12.3675 C102.8159,9.8775 96.0559,9.8775 90.0389,12.3675"
                />
                <path
                  fill="currentColor"
                  d="M105.3122,88.4608 L105.3122,154.0768 C105.3122,157.1978 108.4592,159.3348 111.3602,158.1848 L185.1662,129.5368 C186.8512,128.8688 187.9562,127.2408 187.9562,125.4288 L187.9562,59.8128 C187.9562,56.6918 184.8092,54.5548 181.9082,55.7048 L108.1022,84.3528 C106.4182,85.0208 105.3122,86.6488 105.3122,88.4608"
                />
                <path
                  fill="currentColor"
                  d="M88.0781,91.8464 L66.1741,102.4224 L63.9501,103.4974 L17.7121,125.6524 C14.7811,127.0664 11.0401,124.9304 11.0401,121.6744 L11.0401,60.0884 C11.0401,58.9104 11.6441,57.8934 12.4541,57.1274 C12.7921,56.7884 13.1751,56.5094 13.5731,56.2884 C14.6781,55.6254 16.2541,55.4484 17.5941,55.9784 L87.7101,83.7594 C91.2741,85.1734 91.5541,90.1674 88.0781,91.8464"
                />
              </g>
            </svg>
          </button>
          {/* Omni button placeholder */}
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[rgb(64,124,74)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="flex-none"
            >
              <circle cx="8" cy="8" r="7" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col items-center gap-3">
          {/* Help */}
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[rgb(97,102,112)] hover:bg-[rgb(229,233,240)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="flex-none"
            >
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM2 8a6 6 0 1 1 12 0A6 6 0 0 1 2 8Zm5.25-2.5a.75.75 0 0 1 1.5 0c0 .42-.18.757-.437 1.015A3.4 3.4 0 0 1 7.75 6.9a.75.75 0 0 1-.5-1.414c.197-.07.355-.149.473-.247.11-.092.027-.076.027-.24ZM8 9a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
            </svg>
          </button>
          {/* Notifications */}
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[rgb(97,102,112)] hover:bg-[rgb(229,233,240)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="flex-none"
            >
              <path d="M8 1.5A4.5 4.5 0 0 0 3.5 6v2.29l-.88 1.76A1 1 0 0 0 3.5 11.5h2.1a2.5 2.5 0 0 0 4.8 0h2.1a1 1 0 0 0 .88-1.45L12.5 8.29V6A4.5 4.5 0 0 0 8 1.5Z" />
            </svg>
          </button>
          {/* User avatar */}
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgb(124,55,239)] text-[10px] font-semibold text-white shadow-sm"
          >
            A
          </button>
        </div>
      </aside>

      {/* ── Main app area (right of icon rail) ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <TopBar baseName={localBaseName} onRenameBase={handleRenameBase} />

        {/* Table tabs (green bar) */}
        <TableTabs
          tables={tablesQuery.data ?? []}
          selectedTableId={selectedTableId}
          onSelectTable={handleSelectTable}
          onPrefetchTable={handlePrefetchTable}
          onAddTable={handleAddTable}
          onSeedTable={handleSeedTable}
          isSeeding={seedTable.isPending}
          onBulkInsert={handleBulkInsert}
          isBulkInserting={bulkInsertRows.isPending}
          onRenameTable={handleRenameTable}
          onDuplicateTable={handleDuplicateTable}
          onDeleteTable={handleDeleteTable}
          onClearTableData={handleClearTableData}
        />

        {/* ── Content area: toolbar full width, then sidebar | grid ── */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* Grid toolbar: spans full width (sidebar → right edge), includes collapse button */}
          <GridToolbar
            selectedTableName={selectedTableName}
            globalSearch={globalSearch}
            onGlobalSearchChange={setGlobalSearch}
            fields={fields}
            fieldsCount={fields.length}
            selectedTableId={selectedTableId}
            viewName={selectedViewName}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
            allFields={allFieldsFromGrid}
            hiddenFieldIds={hiddenFieldIds}
            onToggleField={handleToggleField}
            onHideAll={handleHideAll}
            onShowAll={handleShowAll}
            filters={filters}
            onFiltersChange={setFilters}
            sorts={sorts}
            onSortsChange={setSorts}
            showSearch={showSearch}
            onToggleSearch={() => {
              setShowSearch((v) => {
                if (v) setGlobalSearch("");
                return !v;
              });
            }}
            searchMatchCount={searchMatchCount}
            activeSearchMatchIndex={activeSearchMatchIndex}
            onPrevSearchMatch={handlePrevSearchMatch}
            onNextSearchMatch={handleNextSearchMatch}
          />

          {/* View sidebar (collapsible) | Grid */}
          <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
            <ViewsSidebar
              views={viewsQuery.data ?? []}
              selectedViewId={selectedViewId}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
              onSelectView={handleSelectView}
              onCreateView={handleCreateView}
              onRenameView={handleRenameView}
              onDuplicateView={handleDuplicateView}
              onDeleteView={handleDeleteView}
            />

            <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
              {/* View-switching loading overlay */}
              {isViewSwitching && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
                  <div className="flex flex-col items-center gap-3">
                    <svg
                      className="animate-spin"
                      width="28"
                      height="28"
                      viewBox="0 0 28 28"
                      fill="none"
                    >
                      <circle
                        cx="14"
                        cy="14"
                        r="12"
                        stroke="rgb(214,218,226)"
                        strokeWidth="3"
                      />
                      <path
                        d="M14 2a12 12 0 0 1 12 12"
                        stroke="rgb(22,110,225)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-[13px] text-[rgb(97,102,112)]">
                      Loading view...
                    </span>
                  </div>
                </div>
              )}
              {tablesQuery.isError ? (
                <div className="border-b border-[rgb(220,4,59)]/20 bg-[rgb(255,242,250)] px-4 py-3 text-[13px] text-[rgb(177,15,65)]">
                  Failed to load tables. Refresh and try again.
                </div>
              ) : null}

              {selectedTableId ? null : (
                <div className="border-b border-black/10 bg-white px-6 py-4 text-[13px] text-[rgb(97,102,112)]">
                  Create a table to start editing rows and cells.
                </div>
              )}

              <GridTable
                fields={fields}
                rowLookup={rowLookup}
                totalCount={totalCount}
                isLoading={firstPageQuery.isLoading}
                isPlaceholderData={firstPageQuery.isPlaceholderData}
                isError={firstPageQuery.isError}
                editingCell={editingCell}
                selectedRowIds={selectedRowIds}
                onToggleRow={handleToggleRow}
                onToggleAll={handleToggleAll}
                onStartEdit={handleStartEdit}
                onChangeEdit={handleChangeEdit}
                onCommitEdit={handleCommitEdit}
                onCancelEdit={handleCancelEdit}
                onRetry={handleRetry}
                onCreateField={handleCreateField}
                onReorderFields={handleReorderFields}
                onAddRow={handleAddRow}
                onRowContextMenu={handleRowContextMenu}
                onColumnContextMenu={handleColumnContextMenu}
                filteredFieldIds={filteredFieldIds}
                onBulkInsert={handleBulkInsert}
                isBulkInserting={bulkProgress !== null}
                bulkProgress={bulkProgress}
                globalSearch={globalSearch}
                activeSearchMatchIndex={activeSearchMatchIndex}
                onSearchMatchesChange={handleSearchMatchesChange}
                onVisibleRangeChange={handleVisibleRangeChange}
              />
              {contextMenu && (
                <RowContextMenu
                  x={contextMenu.x}
                  y={contextMenu.y}
                  selectedRowIds={Array.from(selectedRowIds)}
                  anchorRowId={contextMenu.anchorRowId}
                  onInsertAbove={handleInsertAbove}
                  onInsertBelow={handleInsertBelow}
                  onDuplicate={handleDuplicateRecord}
                  onDelete={() => {
                    handleDeleteSelected();
                    setContextMenu(null);
                  }}
                  onCopyRecordUrl={handleCopyRecordUrl}
                  onClose={() => setContextMenu(null)}
                />
              )}
              {columnContextMenu && (
                <ColumnContextMenu
                  x={columnContextMenu.x}
                  y={columnContextMenu.y}
                  field={columnContextMenu.field}
                  fieldIndex={columnContextMenu.fieldIndex}
                  isPrimary={columnContextMenu.fieldIndex === 0}
                  onEditField={handleEditField}
                  onDuplicateField={handleDuplicateField}
                  onInsertLeft={handleInsertLeft}
                  onInsertRight={handleInsertRight}
                  onCopyFieldUrl={handleCopyFieldUrl}
                  onEditFieldDescription={handleEditFieldDescription}
                  onSortAscending={handleSortAscending}
                  onSortDescending={handleSortDescending}
                  onFilterByField={handleFilterByField}
                  onGroupByField={handleGroupByField}
                  onHideField={handleHideField}
                  onDeleteField={handleDeleteField}
                  onClose={() => setColumnContextMenu(null)}
                />
              )}
              {editFieldState && (
                <EditFieldPanel
                  field={editFieldState.field}
                  position={editFieldState.position}
                  onSave={(fieldId, name) => {
                    updateField.mutate({ fieldId, name });
                  }}
                  onClose={() => setEditFieldState(null)}
                />
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
