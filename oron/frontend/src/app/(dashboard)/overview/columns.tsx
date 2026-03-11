"use client";

import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export type ActiveClientsTableType = {
  id: string;
  clientName: string;
  intakeDate: string;
  nextVisit: string;
  waiverType: string;
  route: string;
};

export const columns: ColumnDef<ActiveClientsTableType>[] = [
  {
    accessorKey: "clientName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Client Name</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </Button>
    ),
    cell: ({ row }) => (
      <Link
        href={row.original.route}
        className="capitalize text-[#2563EB] font-[500] text-[14px] hover:underline"
      >
        {row.getValue("clientName")}
      </Link>
    ),
  },

  {
    accessorKey: "intakeDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Intake Date</span>
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
          {row.getValue("intakeDate") ? row.getValue("intakeDate") : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "nextVisit",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Next Visit</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <div>{row.getValue("nextVisit") ? row.getValue("nextVisit") : "-"}</div>
      );
    },
  },
  {
    accessorKey: "waiverType",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Waiver Type</span>
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
          {row.getValue("waiverType") ? row.getValue("waiverType") : "-"}
        </div>
      );
    },
  },
];
