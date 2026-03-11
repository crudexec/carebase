"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { StepThreeTableType } from "./Columns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FormSelect from "@/components/input-fields/FormSelect";
import { convertStringArrayToSelectArray } from "@/utils/helpers";
import { CURRENT_SKILL } from "@/constants";
import { useVisitingFormContext } from "../../store/visiting-form-context";

export function StepThreeTable({
  data,
  onDataChange,
  goalIndex,
}: Readonly<{
  data: StepThreeTableType[];
  onDataChange: (newData: StepThreeTableType[]) => void;
  goalIndex: number;
}>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const selectOptions = [
    { label: "No", value: "No" },
    { label: "Yes", value: "Yes" },
  ];

  const {
    state: { isFormDisabled },
  } = useVisitingFormContext();
  const opportunities = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  const handleCellChange = React.useCallback(
    (rowIndex: number, columnId: string, value: any) => {
      onDataChange(
        data.map((row, index) =>
          index === rowIndex ? { ...row, [columnId]: value } : row
        )
      );
    },
    [data, onDataChange]
  );

  const columns = React.useMemo<ColumnDef<StepThreeTableType>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Steps",
        cell: ({ row }) => <div>{row.getValue("id")}</div>,
      },
      {
        accessorKey: "taskAnalysis",
        header: "Task Analysis",
        cell: ({ row }) => <div>{row.getValue("taskAnalysis")}</div>,
      },
      {
        accessorKey: "response",
        header: "Response?",
        cell: ({ row }) => (
          <FormSelect
            name="response"
            labelText=""
            disabled={isFormDisabled}
            placeholder="Select"
            selectContent={selectOptions}
            value={row.getValue("response")}
            data-testid={`response-select-goal${goalIndex}-${row.index + 1}`} // Include goalIndex in test ID
            onValueChange={(value) => {
              handleCellChange(row.index, "response", value);
            }}
          />
        ),
      },
      {
        accessorKey: "promptUsed",
        header: "Prompt Used",
        cell: ({ row }) => (
          <FormSelect
            name="promptUsed"
            labelText=""
            disabled={isFormDisabled}
            placeholder="Select"
            selectContent={convertStringArrayToSelectArray(CURRENT_SKILL)}
            value={row.getValue("promptUsed")}
            data-testid={`prompt-used-select-goal${goalIndex}-${row.index + 1}`}
            onValueChange={(value) =>
              handleCellChange(row.index, "promptUsed", value)
            }
          />
        ),
      },
      {
        accessorKey: "opportunities",
        header: "Opportunities",
        cell: ({ row }) => (
          <FormSelect
            name="opportunities"
            disabled={isFormDisabled}
            labelText=""
            placeholder="Select"
            selectContent={convertStringArrayToSelectArray(opportunities)}
            value={row.getValue("opportunities")}
            data-testid={`opportunities-select-goal${goalIndex}-${
              row.index + 1
            }`}
            onValueChange={(value) =>
              handleCellChange(row.index, "opportunities", value)
            }
          />
        ),
      },
      {
        accessorKey: "success",
        header: "Success",
        cell: ({ row }) => (
          <FormSelect
            name="success"
            labelText=""
            disabled={isFormDisabled}
            placeholder="Select"
            selectContent={convertStringArrayToSelectArray(opportunities)}
            value={row.getValue("success")}
            data-testid={`success-select-goal${goalIndex}-${row.index + 1}`}
            onValueChange={(value) =>
              handleCellChange(row.index, "success", value)
            }
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleCellChange]
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    manualPagination: false,
  });

  return (
    <div className="relative w-full border rounded-lg">
      <div className="overflow-x-auto">
        <Table isForm>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} isForm>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} isForm>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {!table.getRowModel().rows?.length && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
