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

import { columns, DocumentTableType } from "./columns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DocumentUploadModal from "./document-upload-modal";
import { HandbookModal } from "./handbook-preview";

export function DocumentTable({
  data,
  handleChangeDocumentName,
}: Readonly<{
  data: DocumentTableType[];
  handleChangeDocumentName: (documentName: string) => void;
}>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [selectedDocument, setSelectedDocument] =
    React.useState<DocumentTableType | null>(null);
  const [handbookData, setHandbookData] = React.useState({
    downloadUrl: "",
    pdfUrl: "",
  });
  const [isOpen, setIsOpen] = React.useState(false);

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
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    manualPagination: false,
  });

  const handleRowClick = (row: DocumentTableType) => {
    if (row.isHandBook) {
      setIsOpen(true);
      setHandbookData({
        downloadUrl: row.downloadLink,
        pdfUrl: row.handBookPreviewUrl ?? "",
      });
      return;
    }

    if (row.downloadLink.length > 10) {
      handleChangeDocumentName(row.documentName);
    } else {
      setSelectedDocument(row);
      setShowUploadModal(true);
    }
  };

  return (
    <div className="relative w-full border rounded-lg">
      <div className="overflow-auto">
        {showUploadModal && selectedDocument && (
          <DocumentUploadModal
            key={selectedDocument.id}
            showTrigger={false}
            documentName={selectedDocument.documentName}
            isOpen={showUploadModal}
            closeModal={() => setShowUploadModal(false)}
          />
        )}

        {isOpen && (
          <HandbookModal
            isOpen={isOpen}
            closeModal={() => setIsOpen(false)}
            downloadUrl={handbookData.downloadUrl}
            pdfUrl={handbookData.pdfUrl}
          />
        )}

        <Table fullWidth>
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
            {table.getRowModel().rows?.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => handleRowClick(row.original)}
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
                <TableCell colSpan={columns.length}>No results.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
