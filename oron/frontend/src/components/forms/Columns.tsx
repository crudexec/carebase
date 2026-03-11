"use client";

import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

export type FormTableContainer = {
  id: string;
  formName: string;
  progress: number;
  started: string;
  submittedDate: string;
  route: string;
  status:
    | "In Progress"
    | "Not Filled"
    | "Awaiting Approval"
    | "Approved"
    | "Correction Required"
    | "Signed";
  formId?: string;
};

export const columns: ColumnDef<FormTableContainer>[] = [
  {
    accessorKey: "formName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Form Name</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="capitalize text-[#2563EB] font-[500] text-[14px] hover:underline">
        {row.getValue("formName")}
      </div>
    ),
  },
  {
    accessorKey: "progress",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Progress</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="w-[90%] flex items-center gap-1">
        <div className="w-full bg-[#e1e6eb] rounded-[4px] h-[10px] flex cursor-pointer">
          <div
            style={{
              width: `${row.getValue("progress")}%`,
            }}
            className="w-full bg-[#2563EB] rounded-[4px] transition-all duration-300"
          />
        </div>
        <span>{row.getValue("progress")}%</span>
      </div>
    ),
  },
  {
    accessorKey: "started",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Started</span>
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
          {row.getValue("started") ? row.getValue("started") : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "submittedDate",
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
          {row.getValue("submittedDate") ? row.getValue("submittedDate") : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button variant="ghost" className="flex items-center p-0">
        <span>Status</span>
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status");
      let backgroundColor = "";
      let textColor = "";
      switch (status) {
        case "Not Filled":
          backgroundColor = "#EF4444";
          textColor = "white";
          break;
        case "In Progress":
          backgroundColor = "#F79009";
          textColor = "white";
          break;
        case "Awaiting Approval":
          backgroundColor = "gray";
          textColor = "white";
          break;
        case "Approved":
          backgroundColor = "green";
          textColor = "white";
          break;
        case "Signed":
          backgroundColor = "green";
          textColor = "white";
          break;
        case "Correction Required":
          backgroundColor = "#e5863e";
          textColor = "white";
          break;
        default:
          backgroundColor = "white";
          textColor = "white";
          break;
      }
      return (
        <div
          className="capitalize text-white rounded-full px-[10px] py-[2px] text-center xl:w-fit w-full"
          style={{ backgroundColor, color: textColor }}
        >
          {row.getValue("status")}
        </div>
      );
    },
  },
];
