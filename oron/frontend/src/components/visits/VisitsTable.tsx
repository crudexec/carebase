"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
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
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Visit } from "@/types/VisitsTypes";
import { Badge } from "@/components/ui/badge";

interface VisitsTableProps {
  visits: Visit[];
  total: number;
  page: number;
  size: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  isAdmin?: boolean;
}

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "draft":
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          Draft
        </Badge>
      );
    case "awaiting_approval":
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
          Awaiting Approval
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Approved
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const columns: ColumnDef<Visit>[] = [
  {
    accessorKey: "client_name",
    header: "Client Name",
    cell: ({ row }) => (
      <div className="font-medium text-gray-900">
        {row.original.client_name}
      </div>
    ),
  },
  {
    accessorKey: "visit_type",
    header: "Visit Type",
    cell: ({ row }) => (
      <div className="text-gray-700">{row.original.visit_type}</div>
    ),
  },
  {
    accessorKey: "date_of_visit",
    header: "Visit Date",
    cell: ({ row }) => {
      const date = row.original.date_of_visit;
      return (
        <div className="text-gray-700">
          {date ? format(new Date(date), "MMM dd, yyyy") : "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "submitted_date",
    header: "Submitted",
    cell: ({ row }) => {
      const date = row.original.submitted_date;
      return (
        <div className="text-gray-700">
          {date ? format(new Date(date), "MMM dd, yyyy") : "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "staff_name",
    header: "Staff",
    cell: ({ row }) => (
      <div className="text-gray-700">{row.original.staff_name}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.original.status),
  },
];

function TableSkeleton() {
  return (
    <div className="p-4">
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VisitsTable({
  visits,
  total,
  page,
  size,
  loading,
  onPageChange,
  isAdmin = false,
}: VisitsTableProps) {
  const router = useRouter();

  const table = useReactTable({
    data: visits,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / size),
  });

  const totalPages = Math.ceil(total / size);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  const handleRowClick = (visit: Visit) => {
    const baseUrl = isAdmin ? "/admin/clients" : "/clients";
    router.push(
      `${baseUrl}/${visit.client_id}/visits/iiss-visit?formId=${visit.id}`
    );
  };

  if (loading) {
    return <TableSkeleton />;
  }

  if (visits.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-gray-400 mb-2">
          <FileText className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No visits found
        </h3>
        <p className="text-sm text-gray-500">
          Visit notes will appear here once created
        </p>
      </div>
    );
  }

  return (
    <div>
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
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleRowClick(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t">
        <div className="text-sm text-gray-600">
          Showing {(page - 1) * size + 1} to {Math.min(page * size, total)} of{" "}
          {total} results
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPreviousPage}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNextPage}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
