"use client";

import React, { useMemo, useState } from "react";
import Button from "@/components/button/Button";
import { Input } from "@/components/ui/input";
import {
  Download,
  EyeIcon,
  Search,
  Trash,
  UploadCloudIcon,
} from "lucide-react";
import { format } from "date-fns";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Button as HeaderButton } from "@/components/ui/button";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FormInput from "@/components/input-fields/FormInput";
import { Label } from "@/components/ui/label";
import FileUpload from "@/components/file-upload/FileUpload";
import { toast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/constants";
import Loader from "@/components/Loader";
import { retrieveClientById } from "@/use-cases/clients";
import { capitalizeFirstLetter } from "@/utils";
import { retriveClientDocuments } from "@/use-cases/clients";
import { useParams } from "next/navigation";
import Image from "next/image";
import PdfPreview from "@/components/pdf/PdfPreview";
import isOnline from "is-online";
import { getTreatmentPlanQueryKey } from "@/utils/treatmentPlanHelpers";
import { TreatmentPlanDocuments } from "@/types/Events";

export type DocumentTabType = {
  id: string;
  name: string;
  description: string;
  dateUploaded: string;
  fileUrl: string;
};

interface Props {
  clientId: string;
  username: string;
  admin?: boolean;
}

const DocumentsTab = ({ clientId, admin, username }: Props) => {
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentTabType | null>(null);

  const DeleteDocument = ({ row }: { row: Row<DocumentTabType> }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const queryClient = useQueryClient();
    const { clientId } = useParams<{ clientId: string }>();
    const documentName = row.original.name;

    const handleDeleteDocument = async (
      e: React.MouseEvent<HTMLButtonElement>
    ) => {
      e.stopPropagation();
      e.preventDefault();

      try {
        setIsPending(true);

        const online = await isOnline();
        if (!online) {
          toast({
            variant: "destructive",
            description:
              "No internet connection. Please check your connection and try again.",
          });
          return;
        }

        const token = localStorage.getItem("token") as string;
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await fetch(
          `${API_BASE_URL}/treatment/${clientId}/delete/document`,
          {
            method: "DELETE",
            headers: headers,
            body: JSON.stringify({
              document_id: row.original.id,
            }),
          }
        );

        queryClient.invalidateQueries({
          queryKey: ["treatement-plan-documents", clientId],
        });

        const errorData = await response.json();

        if (!response.ok || errorData?.errorMessage) {
          toast({
            variant: "destructive",
            description:
              errorData?.errorMessage ?? "A network errror occurred! Try again",
          });
          return;
        }

        toast({
          variant: "default",
          title: "Success",
          description: "Document Deleted Succesfully",
        });
      } catch (err) {
        console.error("ERROR DELETING DOCUMENT", err);
      } finally {
        setIsPending(false);
      }
    };

    return (
      <div>
        <button
          disabled={isPending}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDeleteModalOpen(true);
          }}
        >
          <Trash className="w-5 h-5 text-[#475569]" strokeWidth={1} />
        </button>

        <Dialog onOpenChange={setIsDeleteModalOpen} open={isDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <Image
                src="/assets/images/dashboard/trashIconBg.svg"
                width={50}
                height={50}
                alt="trash icon"
                className="mx-auto pb-5"
              />
              <DialogTitle className="mx-auto">
                Delete Document - {documentName}
              </DialogTitle>
              <DialogDescription className="text-[14px] font-[200] text-[#475467] text-center pt-3">
                This action cannot be undone
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-3 flex items-center gap-5">
              <DialogClose
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full h-fit p-2 rounded-[6px] bg-[#F1F5F9] text-black"
              >
                Cancel
              </DialogClose>
              <button
                onClick={handleDeleteDocument}
                className="w-full h-fit p-2 rounded-[6px] bg-[#EF4444] text-white disabled:cursor-not-allowed disabled:bg-[#ef444498] flex items-center justify-center gap-3"
              >
                {isPending ? <Loader height="h-fit" /> : "Confirm"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const ViewDocumentModal = () => {
    const fileType =
      selectedDocument &&
      selectedDocument?.fileUrl?.split(".").pop()?.toLowerCase();
    const documentName = selectedDocument?.name;

    return (
      <>
        {selectedDocument && (
          <Dialog
            open={selectedDocument !== null}
            onOpenChange={() => setSelectedDocument(null)}
          >
            <DialogContent className="w-full md:w-[90%] lg:w-[80%] max-w-full h-[90vh] overflow-auto">
              <div className="p-5">
                <div className="w-full flex gap-5 items-center justify-center mx-auto">
                  <h2 className="text-[23px] font-[600] text-[#101828] flex items-center gap-5">
                    {username} - {documentName}
                  </h2>
                </div>

                {/* File Preview */}
                {fileType?.includes("png") ||
                fileType?.includes("jpg") ||
                fileType?.includes("jpeg") ? (
                  <Image
                    src={selectedDocument.fileUrl}
                    alt="Document"
                    className="w-full h-full object-contain"
                    width={500}
                    height={500}
                  />
                ) : fileType?.includes("pdf") ? (
                  <PdfPreview pdfUrl={selectedDocument.fileUrl} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>Preview not available for this file type.</p>
                  </div>
                )}

                <div className="flex bg-white z-[3000] flex-col gap-5 fixed w-[96%] bottom-0 py-3">
                  <div className="w-full flex flex-row flex-wrap gap-5 justify-center md:justify-end mt-auto lg:border-t-[1px] lg:pr-10 lg:py-5 lg:bg-white">
                    <Button
                      variant="light"
                      onClick={() => {
                        setSelectedDocument(null);
                      }}
                      type="button"
                    >
                      Cancel
                    </Button>

                    <a
                      href={selectedDocument.fileUrl}
                      download
                      target="_blank"
                      className="flex items-center justify-center gap-3 px-5 py-3 bg-[#2563EB] hover:bg-[#2564ebd9] active:bg-[#4274e0f3] rounded-[6px] h-fit w-[174px] min-w-[174px] text-[14px] font-[400] text-[#F8FAFC] cursor-pointer"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  };

  const columns: ColumnDef<DocumentTabType>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <HeaderButton
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0"
        >
          <span>Document</span>
          <CaretSortIcon
            className={`h-4 w-4 ml-1 ${
              column.getIsSorted() === "asc" ? "transform rotate-180" : ""
            }`}
          />
        </HeaderButton>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-[#2563EB] font-[500] text-[14px]">
            {row.getValue("name")}
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
      accessorKey: "description",
      header: ({ column }) => (
        <HeaderButton
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0"
        >
          <span>Description</span>
          <CaretSortIcon
            className={`h-4 w-4 ml-1 ${
              column.getIsSorted() === "asc" ? "transform rotate-180" : ""
            }`}
          />
        </HeaderButton>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-[#09090B] font-[400] text-[14px]">
            {row.getValue("description") ?? "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "dateUploaded",
      header: ({ column }) => (
        <HeaderButton
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0"
        >
          <span>Date Uploaded</span>
          <CaretSortIcon
            className={`h-4 w-4 ml-1 ${
              column.getIsSorted() === "asc" ? "transform rotate-180" : ""
            }`}
          />
        </HeaderButton>
      ),
      cell: ({ row }) => {
        return (

          <div className="text-[#09090B] font-[400] text-[14px]">
            {row.getValue("dateUploaded") || "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: ({ column }) => (
        <HeaderButton variant="ghost" className="flex items-center p-0">
          <span>Actions</span>
        </HeaderButton>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();

                setSelectedDocument(row.original);
              }}
              className="flex items-center"
            >
              <EyeIcon className="w-5 h-5 text-[#475569]" strokeWidth={1} />
            </button>
            <a
              onClick={(e) => {
                e.stopPropagation();
              }}
              href={row.original.fileUrl}
              target="_blank"
              download
            >
              <Download className="w-5 h-5 text-[#475569]" strokeWidth={1} />
            </a>
            {admin && <DeleteDocument row={row} />}
          </div>
        );
      },
    },
  ];

  function DocumentTable({ data }: Readonly<{ data: any[] }>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
      React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
      React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const table = useReactTable({
      data: data || [],
      columns,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: setRowSelection,
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 11,
        },
      },
      state: {
        sorting,
        columnFilters,
        columnVisibility,
        rowSelection,
      },
      manualPagination: false,
    });

    return (
      <div className="relative w-full border rounded-lg">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    className={`cursor-pointer `}
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => {
                      setSelectedDocument(row.original);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  const token = localStorage.getItem("token") as string;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [isPending, setIsPending] = useState(false);

  const [documentName, setDocumentName] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");

  const {
    data: documents,
    isLoading: isFetchingDocuments,
    refetch,
  } = useQuery({
    queryKey: ['treatement-plan-documents', clientId],
    queryFn: async () =>
      await retriveClientDocuments(token, clientId),
  });

  const handleUploadDocument = async () => {
    if (!documentName) {
      toast({
        variant: "destructive",
        description: "Please add the document name",
      });
      return;
    }

    if (!fileUrl) {
      toast({
        variant: "destructive",
        description: "Please upload the document",
      });
      return;
    }

    try {
      setIsPending(true);

      const online = await isOnline();
      if (!online) {
        toast({
          variant: "destructive",
          description:
            "No internet connection. Please check your connection and try again.",
        });
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await fetch(
        `${API_BASE_URL}/treatment/${clientId}/add/document`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            document_name: documentName,
            document_url: fileUrl,
            description: documentDescription,
          }),
        }
      );

      await refetch();

      const errorData = await response.json();

      if (!response.ok || errorData?.errorMessage) {
        toast({
          variant: "destructive",
          description:
            errorData?.errorMessage ?? "A network errror occurred! Try again",
        });
        return;
      }

      toast({
        variant: "default",
        title: "Success",
        description: "Document Uploaded Succesfully",
      });
      setIsModalOpen(false);
      setDocumentName("");
      setDocumentDescription("");
      setFileUrl("");
    } catch (err) {
      console.error("ERROR UPLOADING DOCUMENT", err);
    } finally {
      setIsPending(false);
    }
  };

  if (isFetchingDocuments) {
    return <Loader height="h-[5vh]" />;
  }

  return (
    <section className="w-full flex flex-col gap-5">
      <div className="w-full flex flex-wrap items-center gap-3 justify-between">
        <h2 className="text-[#101828] text-[20px] font-[600]">Documents</h2>

        <div className="w-fit flex flex-wrap gap-3">
          <div className="md:w-fit w-full relative flex items-center">
            <div className="absolute left-0 pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-[#94A3B8]" />
            </div>
            <Input
              placeholder="Search documents..."
              className="pl-10 pr-5 border-[#E4E4E7] border-[1.5px] placeholder:text-[#c9c9ca] text-black xl:w-[336px] outline-none focus:border-none"
            />
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="md:w-fit w-full"
            type="button"
          >
            <UploadCloudIcon className="text-white w-5 h-5" />
            Upload Document
          </Button>
        </div>
      </div>

      <DocumentTable
        data={
          documents?.data?.documents?.map((item : TreatmentPlanDocuments) => ({
            id: item.id,
            name: item.document_name,
            description: item.description,
            dateUploaded: format(
              new Date(item.created_at),
              "EEEE - MMMM do, yyyy hh:mma"
            ),
            fileUrl: item.document_url,
          })) || []
        }
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="lg:w-[45%] xl:w-[35%]">
          <h2 className="text-[#101828] text-[24px] font-[600] text-center">
            Upload Document - {username}
          </h2>

          <form className="flex flex-col gap-4">
            <FormInput
              placeholder="Enter the document name"
              labelText="Document Name"
              type="text"
              name="name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
            />
            <FormInput
              placeholder="Please provide a brief description of the document"
              labelText="Description"
              type="text"
              name="description"
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <Label className={`text-[15px] text-[#0F172A] font-[600]`}>
                Upload
              </Label>
              <FileUpload getFileUrl={(file) => setFileUrl(file)} />
            </div>

            <div className="mt-5 flex items-center gap-5 justify-end">
              <button
                disabled={isPending}
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className={`flex items-center justify-center gap-3 px-5 py-3 disabled:bg-[#F1F5F9] disabled:hover:bg-[#F1F5F9] disabled:text-[#0f172a4b] disabled:cursor-not-allowed rounded-[6px] h-fit text-[14px] font-[400] bg-[#d9dde1] w-full hover:bg-[#c7cbce] active:bg-[#a4a7aa] text-[#0F172A]`}
              >
                Cancel
              </button>
              <button
                disabled={isPending}
                type="button"
                className={`flex items-center justify-center gap-3 px-5 py-3 bg-[#2563EB] hover:bg-[#2564ebd9] disabled:bg-[#2564eb69] disabled:hover:bg-[#2564eb69] disabled:text-white disabled:cursor-not-allowed rounded-[6px] h-fit w-full text-[14px] font-[400] active:bg-[#4274e0f3] text-white`}
                onClick={handleUploadDocument}
              >
                Save
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <ViewDocumentModal />
    </section>
  );
};

export default DocumentsTab;
