"use client";

import * as React from "react";
import {
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
import { RespiteTypes, columns } from "./RespiteColumns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import DeleteModal from "@/components/DeleteDialog";
import { deleteVisitForm } from "@/use-cases/clients/new-visit";
import {
  GLOBAL_REDUCER_ACTION_TYPE,
  useGlobalState,
} from "@/context/global-state";
import { toast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import useModal from "@/context/modal";

export const RespiteDeleteModal = () => {
  const queryClient = useQueryClient();
  const { closeModal, data } = useModal("DELETE_MODAL");
  const [loading, setLoading] = React.useState(false);
  const id = data?.id;
  const token = localStorage.getItem("token") ?? "";
  const { dispatch } = useGlobalState();

  return (
    <DeleteModal
      isLoading={loading}
      confirmationText="Deleting a Respite Form also deletes the responses in the form fields. This action cannot be undone"
      handleConfirm={async () => {
        setLoading(true);
        const res = await deleteVisitForm(id, token, "respite");
        queryClient.invalidateQueries({
          queryKey: ["respiteForms"],
        });

        if (res.status) {
          dispatch({
            type: GLOBAL_REDUCER_ACTION_TYPE.DELETE_VISIT,
            payload: id,
          });
          toast({
            description: "Respite form deleted successfully",
            variant: "success",
          });
          closeModal();
        }

        setLoading(false);
      }}
      confirmMationHeader={`Delete Respite Form ${data?.date}?`}
    />
  );
};

export function RespiteTable({
  data,
  admin,
}: Readonly<{
  data: RespiteTypes[];
  admin?: boolean;
}>) {
  const router = useRouter();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="cursor-pointer"
                  onClick={() => router.push(row.original.route)}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
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
      <RespiteDeleteModal />
    </div>
  );
}
