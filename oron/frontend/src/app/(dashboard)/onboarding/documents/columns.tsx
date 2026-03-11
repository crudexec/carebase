"use client";

import { CaretSortIcon, DownloadIcon } from "@radix-ui/react-icons";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import DocumentUploadModal from "./document-upload-modal";
import HandbookPreview from "./handbook-preview";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import FormBanner from "@/components/banner/FormBanner";
import { EyeIcon } from "lucide-react";

export type DocumentTableType = {
  id: string;
  documentName: string;
  dateUploaded: string;
  upload: string;
  status:
    | "Not Submitted"
    | "Submitted"
    | "Awaiting Approval"
    | "Correction Required"
    | "Approved";
  downloadLink: string;
  isHandBook?: boolean;
  handBookPreviewUrl?: string;
  reviewNotes: string | undefined | null;
};

const ReviewModal = ({ reviewNote }: { reviewNote: string }) => {
  return (
    <div>
      {reviewNote && typeof reviewNote === "string" && reviewNote.length > 0 ? (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">See Review</Button>
          </DialogTrigger>
          <DialogContent>
            <div className="w-full flex gap-5 justify-center items-center ml-auto">
              <h2 className="text-[18px]  w-full font-[600] text-black text-center">
                You Have A Pending Review
              </h2>
            </div>

            <FormBanner text={reviewNote} variant="warning" />

            <div className="flex items-center gap-5 lg:flex-nowrap flex-wrap mt-5">
              <DialogClose className="w-full h-fit bg-[#2563EB] hover:bg-[#2b5dca] rounded-[6px] px-5 py-3 text-white disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center text-center justify-center">
                Cancel
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <div></div>
      )}
    </div>
  );
};

const DownloadDocument = ({ fileUrl }: { fileUrl: string }) => {
  return (
    <a
      href={fileUrl}
      target="_blank"
      download
      className="w-[120px] h-fit px-[10px] py-[8px] bg-[#d6d6da] rounded-[6px] text-black flex items-center gap-3 justify-center"
    >
      Download
      <DownloadIcon />
    </a>
  );
};

export const renderDocumentComponent = (row: Row<DocumentTableType>) => {
  if (row.original.isHandBook) {
    return (
      <HandbookPreview
        downloadUrl={row.original.downloadLink}
        pdfUrl={row.original.handBookPreviewUrl ?? ""}
      />
    );
  } else if (!row.original.isHandBook && row.original.downloadLink.length > 1) {
    return <DownloadDocument fileUrl={row.original.downloadLink} />;
  } else {
    return (
      <DocumentUploadModal
        showTrigger
        documentName={row.original.documentName}
      />
    );
  }
};

export const columns: ColumnDef<DocumentTableType>[] = [
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
        <span>Date Uploaded/Signed</span>
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
  {
    accessorKey: "actions",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0 mx-auto w-fit"
      >
        <span>Actions</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 ml-auto w-fit">
        <Button variant="outline" className="flex gap-2 items-center">
          View <EyeIcon className="w-5 h-5" />
        </Button>
        {renderDocumentComponent(row)}
      </div>
    ),
  },
];
