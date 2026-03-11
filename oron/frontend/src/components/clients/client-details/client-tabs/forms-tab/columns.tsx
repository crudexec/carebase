"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { EditIcon, EyeIcon } from "@/components/icons";
import Link from "next/link";
import { Button as HeaderButton } from "@/components/ui/button";
import FormBadge from "@/components/badge/FormBadge";
import { ClientDocumentTypes } from "./types";

export const columns: ColumnDef<ClientDocumentTypes>[] = [
  {
    accessorKey: "document",
    header: ({ column }) => (
      <HeaderButton
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Form</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </HeaderButton>
    ),
    cell: ({ row }) => {
      return (
        <div className="capitalize text-[#2563EB] font-[500] text-[14px]">
          {row.getValue("document")}
        </div>
      );
    },
  },
  {
    accessorKey: "1",
    header: ({ column }) => <></>,
    cell: ({ row }) => {
      return <div className="capitalize w-full"></div>;
    },
  },
  {
    accessorKey: "2",
    header: ({ column }) => <></>,
    cell: ({ row }) => {
      return <div className="capitalize w-full"></div>;
    },
  },
  {
    accessorKey: "3",
    header: ({ column }) => <></>,
    cell: ({ row }) => {
      return <div className="capitalize w-full"></div>;
    },
  },
  {
    accessorKey: "4",
    header: ({ column }) => <></>,
    cell: ({ row }) => {
      return <div className="capitalize w-full"></div>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <HeaderButton
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
      </HeaderButton>
    ),
    cell: ({ row }) => {
      return (
        <FormBadge status={row.getValue("status")}>
          {row.getValue("status")}
        </FormBadge>
      );
    },
  },
  {
    accessorKey: "progress",
    header: ({ column, table }) => {
      return (
        <HeaderButton
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
        </HeaderButton>
      );
    },
    cell: ({ row }) => (
      <div className="w-[90%] flex items-center gap-1">
        <div className="w-full bg-[#e1e6eb] rounded-[4px] h-[10px] flex">
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
    accessorKey: "dateCreated",
    header: ({ column }) => (
      <HeaderButton
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Date Created</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </HeaderButton>
    ),
    cell: ({ row }) => {
      return (
        <div className="capitalize">
          {row.getValue("dateCreated") ? row.getValue("dateCreated") : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "lastModified",
    header: ({ column }) => (
      <HeaderButton
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Last Modified</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </HeaderButton>
    ),
    cell: ({ row }) => {
      return (
        <div className="capitalize">
          {row.getValue("lastModified") ? row.getValue("lastModified") : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "download",
    header: ({ column }) => (
      <HeaderButton variant="ghost" className="flex items-center p-0">
        <span>Actions</span>
      </HeaderButton>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {row.original.admin && (
            <Link
              onClick={(e) => e.stopPropagation()}
              href={row.original.route}
              className="w-fit mr-5"
            >
              <EditIcon />
            </Link>
          )}

          <Link href={row.original.downloadLink} className="w-fit">
            <EyeIcon />
          </Link>
        </div>
      );
    },
  },
];
