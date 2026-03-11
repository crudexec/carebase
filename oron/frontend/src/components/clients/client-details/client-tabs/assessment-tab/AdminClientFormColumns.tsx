"use client";

import React, { useState } from "react";
import {
  CaretSortIcon,
  DotsVerticalIcon,
  DownloadIcon,
  Pencil2Icon,
} from "@radix-ui/react-icons";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Button as HeaderButton } from "@/components/ui/button";
import { ClientTreatmentPlanTableTypes } from "./ClientFormColumns";
import { EditIcon, EyeIcon } from "@/components/icons";
import Link from "next/link";
import FormBadge from "@/components/badge/FormBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CircleCheckBig, Eye, Trash2Icon } from "lucide-react";
import { createTreatmentPlanPDF } from "@/lib/pdf/treatmentPlanPdf";
import pdfMake from "pdfmake/build/pdfmake";
import Loader from "@/components/Loader";
import { toast } from "@/components/ui/use-toast";
import {
  markTreatmentPlanAsActive,
  deleteTreatmentPlan,
} from "@/actions/clients/treatment-plan/treatmentPlan";
import { useQueryClient } from "@tanstack/react-query";
import { getTreatmentPlanQueryKey } from "@/utils/treatmentPlanHelpers";

interface Props {
  row: Row<ClientTreatmentPlanTableTypes>;
}

export const ClientFormsMorOptionsDropDown = ({ row }: Props) => {
  const queryClient = useQueryClient();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isMarkingActive, setIsMarkingActive] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const treatmentPlan = row.original.treatmentData;

  const completed =
    treatmentPlan.status === "not_sent" ||
    treatmentPlan.status === "awaiting_signature" ||
    treatmentPlan.status === "signed" ||
    treatmentPlan.status == "completed";

  const fileName = treatmentPlan?.basicInformation
    ? `Treatment_plan_${treatmentPlan?.basicInformation?.participant_first_name}_${treatmentPlan?.basicInformation?.participant_last_name}.pdf`
    : "unamed_patient";

  const handleDownload = async () => {
    setIsGeneratingPdf(true);
    const docDefinition: any = await createTreatmentPlanPDF(
      treatmentPlan,
      treatmentPlan?.parent_name ?? "",
      treatmentPlan?.treatmentGoalSignature?.parent_signature_url ?? "",
      treatmentPlan?.treatmentGoalSignature?.date_parent_signed ?? ""
    );
    pdfMake.createPdf(docDefinition).download(fileName);
    setIsGeneratingPdf(false);
  };

  const handleMarkAsActive = async () => {
    setIsMarkingActive(true);
    const token = localStorage.getItem("token") as string;

    const response = await markTreatmentPlanAsActive(
      row.original.id,
      row.original.treatmentData.intake_full_id,
      row.original.treatmentData.treatment_plan_type,
      token
    );

    queryClient.invalidateQueries({
      queryKey: getTreatmentPlanQueryKey(
        row.original.treatmentData.treatment_plan_type,
        row.original.treatmentData.intake_full_id
      ),
    });

    setIsMarkingActive(false);
    setIsOpen(false);

    if (response.status) {
      toast({
        title: "Treatment plan marked as active",
        description: "The treatment plan has been marked as active",
      });
      return;
    }

    toast({
      title: "Error marking treatment plan as active",
      description: response.errorMessage,
      variant: "destructive",
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const token = localStorage.getItem("token") as string;

    const response = await deleteTreatmentPlan(row.original.id, token);

    queryClient.invalidateQueries({
      queryKey: getTreatmentPlanQueryKey(
        row.original.treatmentData.treatment_plan_type,
        row.original.treatmentData.intake_full_id
      ),
    });

    setIsDeleting(false);
    setIsOpen(false);

    if (response.status) {
      toast({
        title: "Treatment plan deleted",
        description: "The treatment plan has been deleted successfully",
      });
      return;
    }

    toast({
      title: "Error deleting treatment plan",
      description: response.errorMessage,
      variant: "destructive",
    });
  };

  return (
    <div>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <Button variant="ghost">
            <DotsVerticalIcon className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[10rem]">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className="flex items-center gap-4 w-full font-[400] text-[14px] text-[#334155]"
          >
            <Link
              href={row.original.downloadLink}
              className="flex items-center gap-4 w-full font-[400] text-[14px] text-[#334155]"
            >
              <Eye strokeWidth={1} className="w-5 h-5 text-[#334155]" />
              Preview
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className="flex items-center gap-4 w-full font-[400] text-[14px] text-[#334155]"
          >
            <Link
              href={row.original.route}
              className="flex items-center gap-4 w-full font-[400] text-[14px] text-[#334155]"
            >
              <Pencil2Icon strokeWidth={1} className="w-5 h-5 text-[#334155]" />
              Edit
            </Link>
          </DropdownMenuItem>
          {completed && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="flex items-center gap-4 w-full font-[400] text-[14px] text-[#334155]"
            >
              <DownloadIcon
                strokeWidth={1}
                className="w-5 h-5 text-[#334155]"
              />
              {isGeneratingPdf ? <Loader height="h-fit" /> : "Download"}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAsActive();
            }}
            className="flex items-center gap-4 w-full font-[400] text-[14px] text-[#334155]"
          >
            <CircleCheckBig
              strokeWidth={1}
              className="w-5 h-5 text-[#334155]"
            />
            {isMarkingActive ? <Loader height="h-fit" /> : "Mark as active"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="flex items-center gap-4 w-full font-[400] text-[14px] text-[#334155]"
          >
            <Trash2Icon strokeWidth={1} className="w-5 h-5 text-[#334155]" />
            {isDeleting ? <Loader height="h-fit" /> : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const adminColumns: ColumnDef<ClientTreatmentPlanTableTypes>[] = [
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
          {row.original.treatmentData.active_treatment === true && (
            <FormBadge status={"Active"}>Active</FormBadge>
          )}
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
    header: ({ column }) => <></>,
    cell: ({ row }) => {
      return <ClientFormsMorOptionsDropDown row={row} />;
    },
  },
];
