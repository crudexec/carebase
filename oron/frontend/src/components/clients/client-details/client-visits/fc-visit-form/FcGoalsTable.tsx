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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FormSelect from "@/components/input-fields/FormSelect";
import { FieldError, UseFormClearErrors } from "react-hook-form";

// Updated type to match the new structure
export type FcGoalsTableType = {
  id: string;
  method: string;
  discussedAtSession: string | undefined;
};

interface Props {
  data: FcGoalsTableType[];
  onDataUpdate: (updatedData: FcGoalsTableType[]) => void;
  errors:
    | {
        id?: FieldError;
        method?: FieldError;
        discussedAtSession?: FieldError;
      }[]
    | undefined;
  clearErrors: UseFormClearErrors<{
    goals: {
      goalImplementationDetails: {
        currentTeachingMethods: FcGoalsTableType[];
      };
    }[];
  }>;
  index: number;
}

export const FcGoalsTable = ({
  data,
  onDataUpdate,
  errors,
  clearErrors,
  index,
}: Props) => {
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
    { label: "N/A", value: "N/A" },
  ];

  const columns: ColumnDef<FcGoalsTableType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => <div>No</div>,
      cell: ({ row }) => (
        <div data-testid={`goals-${index + 1}-table-${row.index + 1}-id`}>
          {row.index + 1}
        </div>
      ),
    },
    {
      accessorKey: "method",
      header: ({ column }) => <div>Current Teaching methods/ Strategies</div>,
      cell: ({ row }) => (
        <div data-testid={`goals-${index + 1}-table-${row.index + 1}-method`}>
          {row.getValue("method")}
        </div>
      ),
    },
    {
      accessorKey: "discussedAtSession",
      header: ({ column }) => <div>Discussed at FC Session</div>,
      cell: ({ row }) => {
        const rowValue = row.getValue("discussedAtSession") as string | null;
        const currentSelection = rowValue ?? undefined;

        const rowError = errors?.[row.index]?.discussedAtSession;

        return (
          <div>
            <FormSelect
              name="discussedAtSession"
              labelText=""
              placeholder="Select"
              selectContent={selectOptions}
              value={currentSelection}
              onValueChange={(value) => {
                const updatedData = [...data];
                const rowIndex = updatedData.findIndex(
                  (item) => item.method === row.getValue("method")
                );

                if (rowIndex > -1) {
                  updatedData[rowIndex].discussedAtSession = value ?? null;
                  onDataUpdate(updatedData);

                  if (value && rowError) {
                    clearErrors(
                      `goals.${Math.floor(
                        row.index / data.length
                      )}.goalImplementationDetails.currentTeachingMethods.${
                        row.index % data.length
                      }.discussedAtSession`
                    );
                  }
                }
              }}
              isError={!!rowError}
              data-testid={`goals-${index + 1}-table-${
                row.index + 1
              }-discussed`}
            />
          </div>
        );
      },
    },
  ];

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
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
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
                  <TableCell key={cell.id}>
                    <div>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
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
};
