"use client";

import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

export type AdminDocumentType = {
  id: string;
  documentName: string;
  dateUploaded: string;
  status:
    | "Not Submitted"
    | "Submitted"
    | "Awaiting Approval"
    | "Correction Required"
    | "Approved";
  fileUrl: string;
};

export const columns: ColumnDef<AdminDocumentType>[] = [
  {
    accessorKey: "documentName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Document Name</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="capitalize text-[#2563EB] font-[500] text-[14px]">
        {row.getValue("documentName")}
      </div>
    ),
  },

  {
    accessorKey: "dateUploaded",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Signed/Submitted</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <div className="capitalize">
          {row.getValue("dateUploaded") ? row.getValue("dateUploaded") : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Status</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status");
      let backgroundColor = "";
      let textColor = "";
      switch (status) {
        case "Not Submitted":
          backgroundColor = "#EF4444";
          textColor = "white";
          break;
        case "Not Started":
          backgroundColor = "#EF4444";
          textColor = "white";
          break;
        case "Awaiting Approval":
          backgroundColor = "gray";
          textColor = "white";
          break;
        case "Submitted":
          backgroundColor = "gray";
          textColor = "white";
          break;
        case "Correction Required":
          backgroundColor = "#e5863e";
          textColor = "white";
          break;

        case "Approved":
          backgroundColor = "green";
          textColor = "white";
          break;
        default:
          backgroundColor = "white";
          textColor = "white";
          break;
      }
      return (
        <div
          className="capitalize text-white rounded-full px-[10px] py-[2px] text-center w-fit"
          style={{ backgroundColor, color: textColor }}
        >
          {row.getValue("status")}
        </div>
      );
    },
  },
];
