"use client";

import { useState } from "react";
import { api, type RouterOutputs } from "~/trpc/react";

type BaseItem = RouterOutputs["base"]["list"][number];
type TableItem = RouterOutputs["table"]["listByBase"][number];
type ViewItem = RouterOutputs["view"]["listByTable"][number];
type FieldItem = RouterOutputs["field"]["listByTable"][number];
type RecordItem = RouterOutputs["record"]["listByTable"][number];

export function TrpcContractDemo() {
  const utils = api.useUtils();
  const { data: bases } = api.base.list.useQuery();

  const firstBaseId = bases?.[0]?.id;
  const { data: tables } = api.table.listByBase.useQuery(
    { baseId: firstBaseId ?? "missing-base-id" },
    { enabled: Boolean(firstBaseId) },
  );

  const firstTableId = tables?.[0]?.id;
  const { data: fields } = api.field.listByTable.useQuery(
    { tableId: firstTableId ?? "missing-table-id" },
    { enabled: Boolean(firstTableId) },
  );
  const { data: records } = api.record.listByTable.useQuery(
    { tableId: firstTableId ?? "missing-table-id" },
    { enabled: Boolean(firstTableId) },
  );
  const { data: views } = api.view.listByTable.useQuery(
    { tableId: firstTableId ?? "missing-table-id" },
    { enabled: Boolean(firstTableId) },
  );

  const firstFieldId = fields?.[0]?.id;
  const firstRecordId = records?.[0]?.id;

  const [fieldName, setFieldName] = useState("New Field");
  const [viewName, setViewName] = useState("New View");
  const [cellValue, setCellValue] = useState("Edited from mutation panel");

  const createField = api.field.create.useMutation({
    onSuccess: async () => {
      if (!firstTableId) return;
      await utils.field.listByTable.invalidate({ tableId: firstTableId });
      await utils.table.getById.invalidate({ tableId: firstTableId });
    },
  });

  const createRecord = api.record.create.useMutation({
    onSuccess: async () => {
      if (!firstTableId) return;
      await utils.record.listByTable.invalidate({ tableId: firstTableId });
      await utils.table.getById.invalidate({ tableId: firstTableId });
    },
  });

  const createView = api.view.create.useMutation({
    onSuccess: async () => {
      if (!firstTableId) return;
      await utils.view.listByTable.invalidate({ tableId: firstTableId });
      await utils.table.getById.invalidate({ tableId: firstTableId });
    },
  });

  const upsertCell = api.cell.upsert.useMutation({
    onSuccess: async () => {
      if (!firstTableId) return;
      await utils.record.listByTable.invalidate({ tableId: firstTableId });
      await utils.table.getById.invalidate({ tableId: firstTableId });
    },
  });

  return (
    <section className="mb-6 rounded-lg border border-[#d0d7de] bg-white p-4">
      <h2 className="text-sm font-semibold text-[#57606a]">
        tRPC Contract Demo (Client Hooks)
      </h2>
      <p className="mt-1 text-xs text-[#656d76]">
        Uses RouterOutputs-derived types + useQuery hooks.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-[#24292f] md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Bases from api.base.list"
          value={String((bases as BaseItem[] | undefined)?.length ?? 0)}
        />
        <MetricCard
          label="Tables in first base"
          value={String((tables as TableItem[] | undefined)?.length ?? 0)}
        />
        <MetricCard
          label="Fields in first table"
          value={String((fields as FieldItem[] | undefined)?.length ?? 0)}
        />
        <MetricCard
          label="Views in first table"
          value={String((views as ViewItem[] | undefined)?.length ?? 0)}
        />
        <MetricCard
          label="Records in first table"
          value={String((records as RecordItem[] | undefined)?.length ?? 0)}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-md border border-[#e5e8eb] p-3">
          <div className="mb-2 text-xs font-medium text-[#57606a]">
            Create Field
          </div>
          <input
            value={fieldName}
            onChange={(event) => setFieldName(event.target.value)}
            className="mb-2 w-full rounded border border-[#d0d7de] px-2 py-1 text-xs"
            placeholder="Field name"
          />
          <button
            className="rounded bg-[#1f6feb] px-2 py-1 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              !firstTableId || createField.isPending || !fieldName.trim()
            }
            onClick={() => {
              if (!firstTableId) return;
              createField.mutate({
                tableId: firstTableId,
                name: fieldName.trim(),
              });
            }}
            type="button"
          >
            {createField.isPending ? "Creating..." : "Create Field"}
          </button>
        </div>

        <div className="rounded-md border border-[#e5e8eb] p-3">
          <div className="mb-2 text-xs font-medium text-[#57606a]">
            Create Record
          </div>
          <button
            className="rounded bg-[#1f6feb] px-2 py-1 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!firstTableId || createRecord.isPending}
            onClick={() => {
              if (!firstTableId) return;
              createRecord.mutate({ tableId: firstTableId });
            }}
            type="button"
          >
            {createRecord.isPending ? "Creating..." : "Create Record"}
          </button>
        </div>

        <div className="rounded-md border border-[#e5e8eb] p-3">
          <div className="mb-2 text-xs font-medium text-[#57606a]">
            Create View
          </div>
          <input
            value={viewName}
            onChange={(event) => setViewName(event.target.value)}
            className="mb-2 w-full rounded border border-[#d0d7de] px-2 py-1 text-xs"
            placeholder="View name"
          />
          <button
            className="rounded bg-[#1f6feb] px-2 py-1 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!firstTableId || createView.isPending || !viewName.trim()}
            onClick={() => {
              if (!firstTableId) return;
              createView.mutate({
                tableId: firstTableId,
                name: viewName.trim(),
                type: "GRID",
              });
            }}
            type="button"
          >
            {createView.isPending ? "Creating..." : "Create View"}
          </button>
        </div>

        <div className="rounded-md border border-[#e5e8eb] p-3">
          <div className="mb-2 text-xs font-medium text-[#57606a]">
            Update First Cell
          </div>
          <input
            value={cellValue}
            onChange={(event) => setCellValue(event.target.value)}
            className="mb-2 w-full rounded border border-[#d0d7de] px-2 py-1 text-xs"
            placeholder="Cell value"
          />
          <button
            className="rounded bg-[#1f6feb] px-2 py-1 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              !firstFieldId ||
              !firstRecordId ||
              upsertCell.isPending ||
              !firstTableId
            }
            onClick={() => {
              if (!firstFieldId || !firstRecordId) return;
              upsertCell.mutate({
                fieldId: firstFieldId,
                recordId: firstRecordId,
                value: cellValue,
              });
            }}
            type="button"
          >
            {upsertCell.isPending ? "Saving..." : "Save Cell"}
          </button>
        </div>
      </div>
    </section>
  );
}

function MetricCard(props: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-md border border-[#e5e8eb] bg-[#fcfcfd] p-3">
      <div className="text-[#656d76]">{props.label}</div>
      <div className="mt-1 text-base font-semibold">{props.value}</div>
    </div>
  );
}
