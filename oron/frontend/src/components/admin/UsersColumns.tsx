"use client";

import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import MoreOptions from "./MoreOptions";

export type UserTableContainer = {
  id: string;
  employeeName: string;
  email: string;
  awaitingApproval: string;
  notFilled: string;
  completed: string;
  dateJoined: string;
  onboardingProgress: string;
  role?: string;
  status?: string;
};

const RouteButton = ({
  children,
  route,
}: {
  children: ReactNode;
  route: string;
}) => {
  const router = useRouter();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        router.push(route);
      }}
      className="capitalize text-[#2563EB] font-[500] text-[14px] hover:underline"
    >
      {children}
    </button>
  );
};

export const getColumns = (onStatusChange?: () => void): ColumnDef<UserTableContainer>[] => [
  {
    accessorKey: "employeeName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Employee</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="text-[#0F172A] text-[14px] font-[500]">
          {row.getValue("employeeName")}
        </span>
        <span className="text-[#475569] text-[12px] font-[400]">
          {row.original.email}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Role</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </Button>
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const roleDisplay: Record<string, { label: string; color: string }> = {
        STANDARD: { label: "Employee", color: "bg-blue-100 text-blue-800" },
        CLIENT_MANAGER: { label: "Client Manager", color: "bg-purple-100 text-purple-800" },
        ADMINISTRATOR: { label: "Administrator", color: "bg-green-100 text-green-800" },
        EMPLOYEE_MANAGER: { label: "Employee Manager", color: "bg-orange-100 text-orange-800" },
      };
      const { label, color } = roleDisplay[role] || { label: role, color: "bg-gray-100 text-gray-800" };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
          {label}
        </span>
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
      const status = row.getValue("status") as string;
      const statusDisplay: Record<string, { label: string; dotColor: string; bgColor: string; textColor: string }> = {
        ACTIVE: { label: "Active", dotColor: "bg-green-500", bgColor: "bg-green-50", textColor: "text-green-700" },
        INACTIVE: { label: "Inactive", dotColor: "bg-yellow-500", bgColor: "bg-yellow-50", textColor: "text-yellow-700" },
        DISENGAGED: { label: "Disengaged", dotColor: "bg-red-500", bgColor: "bg-red-50", textColor: "text-red-700" },
      };
      const { label, dotColor, bgColor, textColor } = statusDisplay[status] || { label: "Active", dotColor: "bg-green-500", bgColor: "bg-green-50", textColor: "text-green-700" };
      return (
        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
          <div className={`w-2 h-2 rounded-full ${dotColor}`} />
          {label}
        </div>
      );
    },
  },
  {
    accessorKey: "awaitingApproval",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Awaiting Approval</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </Button>
    ),
    cell: ({ row }) => (
      <RouteButton
        route={`/admin?name=${row.original.employeeName}&id=${row.original.id}&tab=awaitingApproval`}
      >
        {row.getValue("awaitingApproval")
          ? row.getValue("awaitingApproval")
          : "-"}
      </RouteButton>
    ),
  },
  {
    accessorKey: "notFilled",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Not Filled</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <RouteButton
          route={`/admin?name=${row.original.employeeName}&id=${row.original.id}&tab=notFilled`}
        >
          {row.getValue("notFilled") ? row.getValue("notFilled") : "-"}
        </RouteButton>
      );
    },
  },
  {
    accessorKey: "completed",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Completed</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <RouteButton
          route={`/admin?name=${row.original.employeeName}&id=${row.original.id}&tab=approved`}
        >
          {row.getValue("completed") ? row.getValue("completed") : "-"}
        </RouteButton>
      );
    },
  },
  {
    accessorKey: "dateJoined",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Date Joined</span>
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
          {row.getValue("dateJoined") ? row.getValue("dateJoined") : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "onboardingProgress",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Onboarding Progress</span>
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
              width: `${row.getValue("onboardingProgress")}%`,
            }}
            className="w-full bg-[#2563EB] rounded-[4px] transition-all duration-300"
          />
        </div>
        <span>{row.getValue("onboardingProgress")}%</span>
      </div>
    ),
  },
  {
    accessorKey: "moreOptions",
    header: ({ column }) => <></>,
    cell: ({ row }) => {
      return (
        <MoreOptions
          employeeEmail={row.original.email}
          employeeId={row.original.id}
          employeeName={row.original.employeeName}
          currentStatus={row.original.status}
          onStatusChange={onStatusChange}
        />
      );
    },
  },
];

export const columns: ColumnDef<UserTableContainer>[] = getColumns();
