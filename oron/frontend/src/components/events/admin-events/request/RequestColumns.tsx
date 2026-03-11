"use client";

import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils";
import { truncateText } from "@/utils/helpers";
import RequestAction from "./RequestAction";
import { RequestType } from "../types";

export const columns: ColumnDef<RequestType>[] = [
  {
    accessorKey: "staffName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex text-center mx-auto items-center p-0"
      >
        <span>Staff</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center text-[#0F172A] text-[14px] font-[500]">
        {row.getValue("staffName")}
      </div>
    ),
  },
  {
    accessorKey: "clientName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex  text-center mx-auto items-center p-0"
      >
        <span>Current Event</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex  text-center mx-auto flex-col gap-1">
        <h4 className="text-[#101828] text-[14px] font-[500]">
          {row.getValue("clientName")} Visit
        </h4>
        <p className="text-[#475467] text-[10px] font-[400]">
          {formatDate(new Date(row.original.currentEventDate))}{" "}
          {row.original.currentEventTime}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "proposedEventDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex  text-center mx-auto items-center p-0"
      >
        <span>Proposed Date</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <div>
          <p className="text-center text-[#0F172A] text-[14px] font-[500]">
            {formatDate(new Date(row.original.proposedEventDate))}{" "}
            {row.original.proposedEventTime}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "reason",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex text-center mx-auto items-center p-0"
      >
        <span>Reason</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <div className="mx-auto text-center text-[#0F172A] text-[14px] font-[400]">
          <p>{truncateText(row.getValue("reason"), 100)}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Actions</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center mx-auto">
          <RequestAction row={row} />
        </div>
      );
    },
  },
];
