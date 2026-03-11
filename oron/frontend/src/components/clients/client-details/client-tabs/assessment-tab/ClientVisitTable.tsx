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
import { ClientVisitTypes, columns } from "./ClientVisitColumns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter, useParams } from "next/navigation";
import useModal from "@/context/modal";
import DeleteModal from "@/components/DeleteDialog";
import { deleteVisitForm } from "@/use-cases/clients/new-visit";
import {
  GLOBAL_REDUCER_ACTION_TYPE,
  useGlobalState,
} from "@/context/global-state";
import { toast } from "@/components/ui/use-toast";
import { useAppDispatch } from "@/state/hooks";
import { openVisitPdfModal } from "@/state/features/visit-pdf-modal/visitPdfModalSlice";
import { useQueryClient } from "@tanstack/react-query";
import { TreatmentPlanFormTabOptionIdType } from "../../ClientDetailPageWrapper";
import { getVisitQueryKey } from "@/utils/treatmentPlanHelpers";

export const VisitDeleteModal = ({
  formType,
}: {
  formType: TreatmentPlanFormTabOptionIdType;
}) => {
  const { clientId } = useParams<{ clientId: string }>();
  const queryClient = useQueryClient();
  const { closeModal, data } = useModal("DELETE_MODAL");
  const [loading, setLoading] = React.useState(false);
  const id = data?.id;
  const token = localStorage.getItem("token") ?? "";
  const { dispatch } = useGlobalState();

  return (
    <DeleteModal
      isLoading={loading}
      confirmationText="Deleting a Visit Log also deletes the responses in the form fields. This action cannot be undone"
      handleConfirm={async () => {
        setLoading(true);
        const res = await deleteVisitForm(id, token, formType);
        queryClient.invalidateQueries({
          queryKey: getVisitQueryKey(formType, clientId),
        });

        if (res.status) {
          dispatch({
            type: GLOBAL_REDUCER_ACTION_TYPE.DELETE_VISIT,
            payload: id,
          });
          toast({
            description: "Visit deleted successfully",
            variant: "success",
          });
          closeModal();
        }

        setLoading(false);
      }}
      confirmMationHeader={`Delete Visit ${data?.date}?`}
    />
  );
};

export function ClientVisitTable({
  data,
  admin,
  formType,
}: Readonly<{
  data: ClientVisitTypes[];
  admin?: boolean;
  formType: TreatmentPlanFormTabOptionIdType;
}>) {
  const router = useRouter();
  const dispatch = useAppDispatch();

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
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
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
                  onClick={() => {
                    // router.push(`${row.original.route}`);
                    if (row.original.status === "completed") {
                      dispatch(openVisitPdfModal(row.original.visitData));
                    } else {
                      router.push(row.original.route);
                    }
                  }}
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
      <VisitDeleteModal formType={formType} />
    </div>
  );
}
