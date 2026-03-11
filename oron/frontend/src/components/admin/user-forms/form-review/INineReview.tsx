"use client";

import FormBadge from "@/components/badge/FormBadge";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Loader from "@/components/Loader";
import { UserFormInfo } from "@/types/AdminTypes";
import useSendReview from "@/hooks/admin/useSendReview";
import AdminINineFormPDFReader from "@/components/pdf/AdminINinePDFViewer";
import { useRef, useState } from "react";
import { Form, Viewer } from "@pdfme/ui";
import FormBanner from "@/components/banner/FormBanner";
import Button from "@/components/button/Button";
import { DownloadIcon } from "lucide-react";
import { getPlugins } from "@/utils/pdf/pdfHelpers";
import { generate } from "@pdfme/generator";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { approveI9Form } from "@/actions/admin/approve-form";
import { useToast } from "@/components/ui/use-toast";
import BreadCrumb from "@/components/BreadCrumb";

const INineReview = ({
  name,
  formInfo,
  id,
}: {
  name: string;
  formInfo: UserFormInfo | undefined;
  id: string;
}) => {
  const { toast } = useToast();
  const [updatePdf, setUpdatePdf] = useState(false);
  const [compUpdate, setCompUpdate] = useState(false);
  const searchParams = useSearchParams();

  const [downloadLoading, setDownloadLoading] = useState(false);

  const formID = searchParams.get("formId");
  const token = localStorage.getItem("token") as string;

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (inputString: string) => {
      const response = await approveI9Form(token, formID!, inputString);
      if (!response) {
        return toast({
          description: "An error occurred while approving form, try again",
          variant: "destructive",
        });
      }

      return toast({
        description: `${name} I - 9 Form has been approved`,
        variant: "success",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userFormData"],
      });
    },
  });

  const handleCompChange = () => {
    setCompUpdate((prev) => !prev);
  };

  const designerRef = useRef<HTMLDivElement | null>(null);
  const designer = useRef<Form | null>(null);

  const viewerRef = useRef<HTMLDivElement | null>(null);
  const viewer = useRef<Viewer | null>(null);
  const {
    mutate: mutateReview,
    isPending: reviewPending,
    reviewNote,
    handleChange,
  } = useSendReview("i9form", name, formID!);

  const pdfInput =
    formInfo && typeof formInfo !== "boolean"
      ? formInfo.forms.i9.data.i9Form.filled_pdf_json_data
      : "[{}]";

  const document = formInfo?.forms?.i9?.data?.documents;

  const getListName = (index: number): string => {
    let listName = "";

    if (Array.isArray(document)) {
      if (document.length === 2) {
        listName = index === 0 ? "List B Document" : "List C Document";
      } else if (index === 0) {
        listName = "List A Document";
      } else if (index === 1) {
        listName = "List B Document";
      } else {
        listName = "List C Document";
      }
    }
    return listName;
  };

  const generatePdf = async () => {
    setDownloadLoading(true);
    try {
      if (!viewer.current) {
        toast({
          variant: "destructive",
          description:
            "Fetching document... Please wait a minute and try again",
        });
        return;
      }

      const template = viewer.current.getTemplate();
      const inputs = viewer.current.getInputs();

      const pdf = await generate({
        template: {
          basePdf: template.basePdf,
          schemas: template.schemas,
          columns: template.columns,
          sampledata: [{}],
        },
        inputs,
        options: {},
        plugins: getPlugins(),
      });

      const blob = new Blob([pdf.buffer as BlobPart], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(blob);

      if (typeof window !== "undefined" && window.document) {
        const doc = window.document;

        // Create a link element and simulate a click to download the PDF
        const link = doc.createElement("a");
        link.href = pdfUrl;
        link.download = `${name} Personal Information`;
        doc.body.appendChild(link);
        link.click();
        doc.body.removeChild(link);
      } else {
        console.warn("Document is not available");
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setDownloadLoading(false);
    }
  };

  const getStatus = () => {
    if (reviewPending) {
      return "Correction Required";
    } else if (isPending) {
      return "Approved";
    } else {
      return formInfo?.status.i9 ?? "Not Filled";
    }
  };

  return (
    <section className="flex flex-col gap-10 py-10">
      <BreadCrumb
        links={[
          { name: "Employees", route: "/admin" },
          {
            name: name,
            route: `/admin?name=${name}&id=${id}`,
          },
          {
            name: "I - 9",
            route: `/admin?name=${name}&id=${id}&form=i9&formId=${formID}`,
          },
        ]}
      />

      <div className="flex justify-between gap-5 flex-wrap">
        <div className="flex flex-wrap gap-5 items-center">
          <h2 className="text-[#101828] text-[30px] font-[600]">I - 9 Form</h2>
          <FormBadge status={getStatus()}>{getStatus()}</FormBadge>
        </div>
        <div className="flex gap-5 items-center">
          <Dialog>
            <DialogTrigger disabled={formInfo?.status.i9 === "Not Filled"}>
              {reviewPending && (
                <button
                  disabled
                  className="bg-[#e159598a] w-[160px] h-[40px] px-[16px] py-[8px] rounded-[6px] text-[14px] font-[500] text-white"
                >
                  <Loader height="h-fit" />
                </button>
              )}

              {!reviewPending && (
                <button
                  disabled={formInfo?.status.i9 === "Not Filled"}
                  className="flex items-center justify-center gap-2 bg-[#EF4444] hover:bg-[#c82d2d] disabled:cursor-not-allowed disabled:bg-[#e159598a] disabled:hover:bg-[#e159598a] text-white w-fit h-[40px] px-[16px] py-[8px] rounded-[6px] text-[14px] font-[500]"
                >
                  <Image
                    src="/assets/images/dashboard/reviewIcon.svg"
                    width={20}
                    height={20}
                    alt="info icon"
                  />
                  {formInfo?.status?.i9 === "Correction Required"
                    ? "Send Another Review"
                    : "Correction Required"}
                </button>
              )}
            </DialogTrigger>
            <DialogContent
              style={{
                boxShadow: "0 0 2000px rgba(0, 0, 0, 0.5)",
              }}
              className="bg-white rounded-[12px] flex flex-col gap-5 shadow-2xl shadow-black/50"
            >
              <div className="w-full flex gap-5 justify-center items-center ml-auto">
                <h2 className="text-[18px] w-full font-[600] text-[#101828] text-center">
                  Correction Required
                </h2>
              </div>

              <p className="text-[14px] font-[400] text-[#475467] text-center">
                The feedback would be sent to the employee
              </p>

              <div className="flex flex-col gap-5 mt-3">
                <Textarea
                  value={reviewNote}
                  onChange={(e) => handleChange(e.target.value)}
                  id="review"
                  placeholder="Enter form review"
                />
              </div>

              <DialogFooter className="flex items-center gap-5 lg:flex-nowrap flex-wrap mt-5">
                <DialogClose className="w-full bg-[#F1F5F9] rounded-[6px] px-5 py-3 h-fit text-black disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center gap-3 justify-center">
                  Cancel
                </DialogClose>

                <DialogClose
                  onClick={() => {
                    mutateReview(name);
                  }}
                  className="w-full h-fit bg-[#2563EB] hover:bg-[#2b5dca] rounded-[6px] px-5 py-3 text-white ddisabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center gap-3 justify-center"
                >
                  Send Review
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {formInfo?.status.i9 === "Approved" && downloadLoading && (
            <div className="w-[120px] h-fit px-[10px] py-[8px] bg-[#d6d6da] rounded-[6px] text-black flex items-center gap-3 justify-center text-[14px]">
              <Loader height="h-fit" />
            </div>
          )}

          {formInfo?.status.i9 === "Approved" && !downloadLoading && (
            <button
              onClick={generatePdf}
              disabled={downloadLoading}
              className="w-[120px] h-fit px-[10px] py-[8px] bg-[#d6d6da] disabled:bg-[#d6d6da89] disabled:cursor-not-allowed rounded-[6px] text-black flex items-center gap-3 justify-center text-[14px]"
            >
              {downloadLoading ? (
                <Loader height="h-fit" />
              ) : (
                <div className="flex items-center gap-2">
                  Download
                  <DownloadIcon className="w-4 h-4" />
                </div>
              )}
            </button>
          )}

          {formInfo?.status.i9 !== "Approved" && (
            <Dialog>
              <DialogTrigger>
                <Button
                  disabled={formInfo?.status.i9 === "Not Filled" || isPending}
                  isLoading={isPending}
                >
                  Complete Form
                </Button>
              </DialogTrigger>

              <DialogContent
                style={{
                  boxShadow: "0 0 2000px rgba(0, 0, 0, 0.5)",
                }}
                className="bg-white rounded-[12px] flex flex-col gap-5 shadow-2xl shadow-black/50"
              >
                <Image
                  src="/assets/images/dashboard/infoIconBg.svg"
                  width={70}
                  height={70}
                  alt="info icon"
                  className="mx-auto"
                />

                <h2 className="sm:w-[90%] font-[700] text-[18px] text-center mx-auto text-[#101828]">
                  Are you sure you&apos;ve filled out the employer section?
                </h2>
                <p className="sm:w-[90%] text-[#475467] text-[14px] font-[400] text-center mx-auto">
                  Completing this form will save it as the official record.
                  After this, you won&apos;t be able to make any further
                  changes.
                </p>

                <DialogFooter className="flex items-center gap-5 lg:flex-nowrap flex-wrap mt-5">
                  <DialogClose className="w-full bg-[#F1F5F9] rounded-[6px] px-5 py-2 h-fit text-black disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center gap-3 justify-center">
                    Cancel
                  </DialogClose>

                  <DialogClose
                    onClick={() => {
                      if (designer.current) {
                        const inputs = designer.current.getInputs();
                        const inputString = JSON.stringify(inputs);
                        mutate(inputString);
                      }
                    }}
                    className="w-full h-fit bg-[#2563EB] hover:bg-[#2b5dca] rounded-[6px] px-5 py-2 text-white ddisabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center gap-3 justify-center"
                  >
                    Complete
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {formInfo?.status?.i9 === "Correction Required" && (
        <FormBanner
          variant="warning"
          text={formInfo?.forms?.i9?.data?.i9Form?.review_notes ?? ""}
        />
      )}

      <div className="flex border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 flex-col gap-5 mt-5 h-fit py-10 p-5 rounded-[12px]">
        <h2 className="text-[18px] font-[600] text-[#0F172A]">
          Personal Information
        </h2>
        <AdminINineFormPDFReader
          viewer={viewer}
          viewerRef={viewerRef}
          inputs={pdfInput}
          designer={designer}
          handleCompChange={handleCompChange}
          designerRef={designerRef}
          status={formInfo?.status.i9!}
        />
      </div>

      <div className="flex flex-col gap-5 border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 h-fit py-10 p-5 rounded-[12px]">
        <h2 className="text-[18px] font-[600] text-[#0F172A]">Documents</h2>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-6">
            {Array.isArray(document) ? (
              document.map((item, index) => (
                <div className="flex flex-col gap-5" key={item.id}>
                  <h2 className="text-[17px] font-[700] text-[#0F172A]">
                    {getListName(index)}
                  </h2>

                  <div className="w-fit flex flex-col md:flex-row items-center gap-3">
                    <div className="xl:w-[480px] h-[60px] p-5 flex items-center gap-5 border-[1px] border-[#E4E4E7] rounded-[12px]">
                      <Image
                        src="/assets/images/dashboard/fileIcon.svg"
                        width={30}
                        height={30}
                        alt="file icon"
                      />
                      <span className="text-[14px] font-[600] text-[#2563EB]">
                        {item?.title ?? "-"}
                      </span>

                      <a
                        className="text-gray-400 hover:text-black ml-auto text-[13px] font-[400] underline cursor-pointer"
                        href={item?.file_url}
                        target="_blank"
                      >
                        View in another page
                      </a>
                    </div>
                    <a
                      download
                      href={item?.file_url}
                      className="bg-[#f4f6f7] hover:bg-[#d0d2d4] h-[50px] rounded-[6px] px-[20px] py-[8px] text-[#0F172A] text-[14px] font-[500] flex gap-5 items-center md:ml-auto cursor-pointer"
                    >
                      Download
                      <Image
                        src="/assets/images/dashboard/downloadIcon.svg"
                        width={15}
                        height={15}
                        alt="download icon"
                      />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col gap-5">
                <h2 className="text-[17px] font-[700] text-[#0F172A]">
                  List A Document
                </h2>

                <div className="w-fit flex flex-col md:flex-row items-center gap-3">
                  <div className="xl:w-[480px] h-[60px] p-5 flex items-center gap-5 border-[1px] border-[#E4E4E7] rounded-[12px]">
                    <Image
                      src="/assets/images/dashboard/fileIcon.svg"
                      width={30}
                      height={30}
                      alt="file icon"
                    />
                    <span className="text-[14px] font-[600] text-[#2563EB]">
                      {document?.title ?? "-"}
                    </span>

                    <a
                      className="text-gray-400 hover:text-black ml-auto text-[13px] font-[400] underline cursor-pointer"
                      href={document?.file_url}
                      target="_blank"
                    >
                      View in another page
                    </a>
                  </div>
                  <a
                    download
                    href={document?.file_url}
                    className="bg-[#f4f6f7] hover:bg-[#d0d2d4] h-[50px] rounded-[6px] px-[20px] py-[8px] text-[#0F172A] text-[14px] font-[500] flex gap-5 items-center md:ml-auto cursor-pointer"
                  >
                    Download
                    <Image
                      src="/assets/images/dashboard/downloadIcon.svg"
                      width={15}
                      height={15}
                      alt="download icon"
                    />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default INineReview;
