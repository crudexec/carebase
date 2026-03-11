"use client";

import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { Button as HeaderButton } from "@/components/ui/button";
import TreatmentPlanPDFDOwnload from "./DownloadTreatmentPDF";
import FormBadge from "@/components/badge/FormBadge";
import { SingleTreatmentPlan } from "@/types/Events";

export type ClientTreatmentPlanTableTypes = {
  id: string;
  document: string;
  progress: number;
  dateCreated: string;
  lastModified: string;
  route: string;
  formId: string;
  tpType: string;
  downloadLink: string;
  admin: boolean;
  status: string;
  treatmentData: SingleTreatmentPlan;
};

export const columns: ColumnDef<ClientTreatmentPlanTableTypes>[] = [
  {
    accessorKey: "document",
    header: ({ column }) => (
      <HeaderButton
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Treatment Plan</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </HeaderButton>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex gap-2 items-center">
          <p className="capitalize text-[#2563EB] font-[500] text-[14px]">
            {row.original.document}
          </p>
          <FormBadge status={"active"}>Active</FormBadge>
        </div>
      );
    },
  },
  {
    accessorKey: "tpType",
    header: ({ column }) => (
      <HeaderButton
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>TP Type</span>
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
          {row.getValue("tpType") ? row.getValue("tpType") : "-"}
        </div>
      );
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
          <TreatmentPlanPDFDOwnload
            clientId={row.original.id}
            href={row.original.downloadLink}
            treatmentPlan={row.original.treatmentData}
          />
        </div>
      );
    },
  },
];
