"use client";

import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { Button as HeaderButton } from "@/components/ui/button";
import Button from "@/components/button/Button";
import FormBadge from "@/components/badge/FormBadge";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import useModal from "@/context/modal";
import { TrashIcon, EditIcon } from "@/components/icons";

export type RespiteTypes = {
  id: string;
  date: string;
  staff: string;
  lastModified: string;
  route: string;
  status?: string | "in_progress" | "completed";
  admin: boolean;
};

const DeleteButton = ({
  completed,
  id,
  date,
}: {
  completed?: boolean;
  id: string;
  date: string;
}) => {
  const { openModal } = useModal("DELETE_MODAL");

  return (
    <HeaderButton
      variant="ghost"
      className="p-0 bg-transparent hover:bg-transparent h-fit w-fit"
      disabled={completed}
      onClick={(e) => {
        e.stopPropagation();
        openModal({ id, date });
      }}
    >
      <TrashIcon color={completed ? "#CBD5E1" : "#475569"} />
    </HeaderButton>
  );
};

export const columns: ColumnDef<RespiteTypes>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <HeaderButton
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Date</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </HeaderButton>
    ),
    cell: ({ row }) => (
      <div className="capitalize text-[#2563EB] font-[500] text-[14px] hover:underline">
        {row.getValue("date")}
      </div>
    ),
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
    accessorKey: "staff",
    header: ({ column }) => (
      <HeaderButton
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Staff</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </HeaderButton>
    ),
    cell: ({ row }) => {
      return <div className="capitalize">{row.getValue("staff")}</div>;
    },
  },
  {
    accessorKey: "Status",
    header: ({ column }) => (
      <HeaderButton
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0 text-center px-3  w-full"
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
      const status = row.original.status?.toLowerCase();
      const badge =
        status === "completed" ? (
          <FormBadge status="Submitted">Completed</FormBadge>
        ) : (
          <FormBadge status="Draft">Draft</FormBadge>
        );
      return <div className="capitalize text-center p-0">{badge}</div>;
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
    accessorKey: "edit",
    maxSize: 2,
    header: ({ column }) => <></>,
    cell: ({ row }) => {
      const status = row.original.status?.toLowerCase();

      return row.original.admin ? (
        <div className="flex gap-4 items-center">
          <Link
            onClick={(e) => e.stopPropagation()}
            href={`${row.original.route}&mode=view`}
          >
            <EyeIcon strokeWidth={1} className="text-[#475569]" />
          </Link>
          <Link onClick={(e) => e.stopPropagation()} href={row.original.route}>
            <EditIcon color={"#475569"} />
          </Link>
          <DeleteButton
            completed={false}
            date={row.original.date}
            id={row.original.id}
          />
        </div>
      ) : (
        <div className="flex gap-4 items-center">
          <Button
            asRouter={true}
            route={row.original.route}
            disabled={status === "completed"}
          >
            <EditIcon color={status === "completed" ? "#CBD5E1" : "#475569"} />
          </Button>
          <DeleteButton
            completed={status === "completed"}
            date={row.original.date}
            id={row.original.id}
          />
        </div>
      );
    },
  },
];
