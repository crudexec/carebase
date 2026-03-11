"use client";

import { CaretSortIcon, DotsVerticalIcon } from "@radix-ui/react-icons";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../ui/use-toast";
import { FullIntakeType } from "@/types/IntakeForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";
import Loader from "../Loader";
import { deleteClientById } from "@/actions/clients/client";
import ExportClientVisits from "./ExportClientVisits";

export type ClientsTableContainer = {
  id: string;
  clientName: string;
  location: string;
  intakeDate: string;
  waiverType: string;
  status:
    | "Active"
    | "Inactive"
    | "Not Admitted"
    | "Draft"
    | "Disengage"
    | "New Intake";
  route: string;
};

interface Props {
  row: Row<ClientsTableContainer>;
}
const DeleteIntake = ({ row }: Props) => {
  const [isPending, setIsPending] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showExportVisitModal, setShowExportVisitModal] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteIntake = async (e: any) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      setIsPending(true);

      const token = localStorage.getItem("token") as string;
      const response = await deleteClientById(row.original.id, token);

      queryClient.invalidateQueries({
        queryKey: ["fullIntake"],
      });

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      setDeleteModalOpen(false);
      toast({
        variant: "default",
        description: `${row.original.clientName} deleted successfully`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: "An error occurred while trying to delete client.",
      });
      throw new Error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          data-testid="client-actions-dropdown"
        >
          <Button variant="ghost">
            <DotsVerticalIcon className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[10rem]">
          <DropdownMenuItem
            onClick={async (e) => {
              e.stopPropagation();
              setShowExportVisitModal(true);
            }}
          >
            Export Visits
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async (e) => {
              e.stopPropagation();
              setDeleteModalOpen(true);
            }}
            data-testid="delete-client-option"
          >
            Delete Client
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          className="lg:w-[400px]"
          data-testid="delete-client-modal"
        >
          <Image
            src="/assets/images/dashboard/trashIconBg.svg"
            width={50}
            height={50}
            alt="trash icon"
            className="mx-auto"
          />

          <h2 className="text-[#101828] font-[700] text-[18px] text-center">
            Delete Client {row.original.clientName}
          </h2>

          <p className="w-[90%] mx-auto text-center text-[#475467] text-[14px] font-[400]">
            Deleting a client also deletes all the client&apos;s records. This
            action cannot be undone.
          </p>

          <div className="flex items-center gap-5 justify-end mt-5">
            <button
              disabled={isPending}
              type="button"
              onClick={() => {
                setDeleteModalOpen(false);
              }}
              className={`flex items-center justify-center gap-3 px-5 py-3 disabled:bg-[#F1F5F9] disabled:hover:bg-[#F1F5F9] disabled:text-[#0f172a4b] disabled:cursor-not-allowed rounded-[6px] h-fit w-full text-[14px] font-[400] bg-[#d9dde1] hover:bg-[#c7cbce] active:bg-[#a4a7aa] text-[#0F172A]`}
            >
              Cancel
            </button>
            <button
              data-testid="confirm-delete-button"
              disabled={isPending}
              type="button"
              onClick={deleteIntake}
              className={`flex items-center justify-center gap-3 px-5 py-3 bg-[#EF4444] hover:bg-[#db3d3d] disabled:bg-[#e860606e] disabled:hover:bg-[#e860606e] disabled:text-white disabled:cursor-not-allowed rounded-[6px] h-fit w-full text-[14px] font-[400] active:bg-[#ae3030] text-white`}
            >
              {isPending ? <Loader height="h-fit" /> : "Delete"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ExportClientVisits
        showModal={showExportVisitModal}
        setShowModal={setShowExportVisitModal}
        clientName={row.original.clientName}
        clientId={row.original.id}
      />
    </div>
  );
};

export const columns: ColumnDef<ClientsTableContainer>[] = [
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
        data-testid={`client-name-${row.original.id}`}
      >
        {row.getValue("clientName")}
      </Link>
    ),
  },

  {
    accessorKey: "intakeDate",
    header: ({ column }) => (
      <Button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
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
    accessorKey: "location",
    header: ({ column }) => (
      <Button variant="ghost" className="flex items-center p-0">
        <span>Location</span>
      </Button>
    ),
    cell: ({ row }) => (
      <div>{row.getValue("location") ? row.getValue("location") : "-"}</div>
    ),
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
        case "Active":
          backgroundColor = "#12B76A";
          textColor = "white";
          break;
        case "Inactive":
          backgroundColor = "#64748B";
          textColor = "white";
          break;
        case "Not Admitted":
          backgroundColor = "red";
          textColor = "white";
          break;
        case "New Intake":
          backgroundColor = "#2563EB";
          textColor = "white";
          break;
        case "Draft":
          backgroundColor = "gray";
          textColor = "white";
          break;
        case "Disengage":
          backgroundColor = "#F79009";
          textColor = "white";
          break;
        default:
          backgroundColor = "#3374FF";
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
  {
    accessorKey: "actions",
    header: ({ column }) => <></>,
    cell: ({ row }) => {
      return (
        <div className="capitalize w-fit">
          <DeleteIntake row={row} />
        </div>
      );
    },
  },
];
