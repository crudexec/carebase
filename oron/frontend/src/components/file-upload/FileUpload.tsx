"use client";

import { useState, useEffect } from "react";
import { UploadIcon } from "@radix-ui/react-icons";
import { Label } from "@/components/ui/label";
import { handleDocumentUpload } from "@/actions/upload";
import Image from "next/image";
import { formatFileSize } from "@/utils";
import Loader from "../Loader";
import { Trash } from "lucide-react";

interface Props {
  getFileUrl?: (fileUrl: string) => void;
  getUploadStatus?: (status: boolean) => void;
  defaultText?: string;
  getFileSize?: (fileSize: string) => void;
  defaultFileUrl?: string;
  disabled?: boolean;
  xkey?: number;
  acceptPdfOnly?: boolean;
}

const FileUpload = ({
  getFileUrl,
  getUploadStatus,
  defaultText,
  getFileSize,
  defaultFileUrl,
  disabled,
  xkey,
  acceptPdfOnly,
}: Props) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileSelectedText, setFileSelectedText] = useState<string>(
    defaultText ?? "Click to upload"
  );
  const [fileSize, setFileSize] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string>(defaultFileUrl ?? "");

  useEffect(() => {
    if (defaultText) {
      setFileSelectedText(defaultText);
    }
  }, [defaultText]);

  useEffect(() => {
    if (defaultFileUrl) {
      setFileUrl(defaultFileUrl);
    }
  }, [defaultFileUrl]);

  const handleDragLeave = (e: React.DragEvent<any>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent<any>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    setIsLoading(true);
    getUploadStatus && getUploadStatus(true);

    e.preventDefault();

    const token = localStorage.getItem("token") as string;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFileSelectedText(droppedFile.name);
      setFileSize(formatFileSize(droppedFile.size));
      getFileSize && getFileSize(formatFileSize(droppedFile.size));

      const formData = new FormData();

      formData.append("document", droppedFile);

      const fileUrl = await handleDocumentUpload(formData, token);

      setDragActive(false);
      setFileUrl(fileUrl);
      getFileUrl && getFileUrl(fileUrl);
      setIsLoading(false);
      getUploadStatus && getUploadStatus(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();
    setIsLoading(true);

    getUploadStatus && getUploadStatus(true);

    const file = event.target?.files?.[0];
    const token = localStorage.getItem("token") as string;

    if (file) {
      setFileSelectedText(file.name);
      setFileSize(formatFileSize(file.size));
      getFileSize && getFileSize(formatFileSize(file.size));

      const formData = new FormData();

      formData.append("document", file);

      const fileUrl = await handleDocumentUpload(formData, token);

      setFileUrl(fileUrl);
      getFileUrl && getFileUrl(fileUrl);
      getUploadStatus && getUploadStatus(false);
      setIsLoading(false);
    } else {
      setFileSelectedText("Click to upload");
    }
  };

  return (
    <div
      className={`${isLoading && "rounded-lg flex flex-col gap-5"} ${
        fileUrl.length > 1 && "border-dotted rounded-lg flex flex-col gap-5"
      } flex flex-col gap-5`}
      key={xkey}
    >
      {fileUrl.length < 1 && !isLoading && (
        <Label
          aria-disabled={true}
          htmlFor={`uploadDocument-${xkey}`}
          className={`w-full  ${
            isLoading || fileUrl.length > 1 || disabled
              ? "cursor-not-allowed"
              : "cursor-pointer"
          }  h-fit p-5 rounded-[6px] border-[#E4E4E7] border-[1px] flex items-center flex-col justify-center gap-3 mx-auto ${
            dragActive && "border-dotted border-2 border-sky-500"
          } `}
          onDrop={(e) =>
            !isLoading && fileUrl.length <= 1 && !disabled && handleDrop(e)
          }
          onDragLeave={(e) =>
            !isLoading && fileUrl.length <= 1 && !disabled && handleDragLeave(e)
          }
          onDragOver={(e) =>
            !isLoading && fileUrl.length <= 1 && !disabled && handleDragOver(e)
          }
          onDragEnter={(e) =>
            !isLoading && fileUrl.length <= 1 && !disabled && handleDragOver(e)
          }
        >
          <div className="w-fit h-fit p-2 rounded-full bg-[#F2F4F7] border-[1px] flex items-center flex-col justify-center gap-3">
            <UploadIcon className="w-5 h-5" />
          </div>
          <div className="flex flex-col lg:flex-row flex-wrap text-center justify-center gap-1 items-center">
            <input
              onChange={async (e) =>
                !isLoading && fileUrl.length <= 1 && (await handleFileSelect(e))
              }
              id={`uploadDocument-${xkey}`}
              type="file"
              accept={acceptPdfOnly ? ".pdf" : ".pdf,.doc,.docx,image/*"}
              style={{ display: "none" }}
              name="uploadedDocumentFile"
              disabled={isLoading || fileUrl.length > 1}
            />
            <p className="text-[14px] font-[500] text-[#2563EB]">
              Click to upload
            </p>
            <p className="text-[14px] font-[400] text-[#475467]">
              or drag and drop file
            </p>
          </div>
        </Label>
      )}

      {isLoading && (
        <div className="w-full cursor-pointer h-fit p-5 rounded-[6px] border-[#E4E4E7] border-[1px] flex items-center gap-6 mx-auto">
          <Image
            src="/assets/images/dashboard/fileIcon.svg"
            width={50}
            height={50}
            alt="file icon"
          />

          <div className="flex flex-col">
            <h2 className="text-[#344054] font-[500] text-[14px]">
              {fileSelectedText}
            </h2>
            <p className="text-[#344054] font-[400] text-[14px]">{fileSize}</p>
            <Loader height="h-fit" />
          </div>
        </div>
      )}

      {fileUrl.length > 1 && (
        <div className="w-full cursor-pointer h-fit p-5 rounded-[6px] border-[#E4E4E7] border-[1px] flex items-center gap-6 mx-auto">
          <Image
            src="/assets/images/dashboard/fileIcon.svg"
            width={50}
            height={50}
            alt="file icon"
          />

          <div className="flex flex-col">
            <a
              href={fileUrl}
              target="_blank"
              className="text-[#344054] font-[500] text-[14px] hover:underline"
            >
              {fileSelectedText}
            </a>
            <p className="text-[#344054] font-[400] text-[14px]">{fileSize}</p>
          </div>

          <button
            disabled={disabled}
            className="ml-auto disabled:cursor-not-allowed"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              setFileUrl("");
              getFileUrl && getFileUrl("");
              setFileSelectedText("Click to upload");
              setFileSize("");
              getFileSize && getFileSize("");
              setIsLoading(false);
              getUploadStatus && getUploadStatus(false);
            }}
          >
            <Trash className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export const DocumentBUpload = ({
  getFileAUrl,
  getUploadStatus,
  defaultText,
  getFileSize,
  defaultFileUrl,
  disabled,
  xkey,
}: any) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileSelectedText, setFileSelectedText] = useState<string>(
    defaultText ?? "Click to upload"
  );
  const [fileSize, setFileSize] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string>(defaultFileUrl ?? "");

  useEffect(() => {
    if (defaultFileUrl) {
      setFileUrl(defaultFileUrl);
    }
  }, [defaultFileUrl]);

  const handleDragLeave = (e: React.DragEvent<any>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent<any>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    setIsLoading(true);

    getUploadStatus && getUploadStatus(true);

    e.preventDefault();

    const token = localStorage.getItem("token") as string;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFileSelectedText(droppedFile.name);
      setFileSize(formatFileSize(droppedFile.size));
      getFileSize && getFileSize(formatFileSize(droppedFile.size));

      const formData = new FormData();

      formData.append("document", droppedFile);

      const fileUrl = await handleDocumentUpload(formData, token);

      setDragActive(false);
      setFileUrl(fileUrl);
      getFileAUrl && getFileAUrl(fileUrl);
      setIsLoading(false);
      getUploadStatus && getUploadStatus(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();

    setIsLoading(true);

    getUploadStatus && getUploadStatus(true);

    const file = event.target?.files?.[0];
    const token = localStorage.getItem("token") as string;

    if (file) {
      setFileSelectedText(file.name);
      setFileSize(formatFileSize(file.size));
      getFileSize && getFileSize(formatFileSize(file.size));

      const formData = new FormData();

      formData.append("document", file);

      const fileUrl = await handleDocumentUpload(formData, token);

      setFileUrl(fileUrl);
      getFileAUrl && getFileAUrl(fileUrl);
      getUploadStatus && getUploadStatus(false);
      setIsLoading(false);
    } else {
      setFileSelectedText("Click to upload");
    }
  };

  return (
    <div
      className={`${isLoading && "rounded-lg flex flex-col gap-5"} ${
        fileUrl.length > 1 && "border-dotted rounded-lg flex flex-col gap-5"
      } flex flex-col gap-5`}
      key={xkey}
    >
      {fileUrl.length < 1 && (
        <Label
          aria-disabled={true}
          htmlFor={`uploadDocument-${xkey}`}
          className={`w-full  ${
            isLoading || fileUrl.length > 1 || disabled
              ? "cursor-not-allowed"
              : "cursor-pointer"
          }  h-fit p-5 rounded-[6px] border-[#E4E4E7] border-[1px] flex items-center flex-col justify-center gap-3 mx-auto ${
            dragActive && "border-dotted border-2 border-sky-500"
          } `}
          onDrop={(e) =>
            !isLoading && fileUrl.length <= 1 && !disabled && handleDrop(e)
          }
          onDragLeave={(e) =>
            !isLoading && fileUrl.length <= 1 && !disabled && handleDragLeave(e)
          }
          onDragOver={(e) =>
            !isLoading && fileUrl.length <= 1 && !disabled && handleDragOver(e)
          }
          onDragEnter={(e) =>
            !isLoading && fileUrl.length <= 1 && !disabled && handleDragOver(e)
          }
        >
          <div className="w-fit h-fit p-2 rounded-full bg-[#F2F4F7] border-[1px] flex items-center flex-col justify-center gap-3">
            <UploadIcon className="w-5 h-5" />
          </div>
          <div className="flex flex-col lg:flex-row flex-wrap text-center justify-center gap-1 items-center">
            <input
              onChange={async (e) =>
                !isLoading && fileUrl.length <= 1 && (await handleFileSelect(e))
              }
              id={`uploadDocument-${xkey}`}
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              style={{ display: "none" }}
              name="uploadedDocumentFile"
              disabled={isLoading || fileUrl.length > 1}
            />
            <Label
              htmlFor="uploadDocument"
              className="text-[14px] font-[500] text-[#2563EB]"
            >
              Click to upload
            </Label>
            <p className="text-[14px] font-[400] text-[#475467]">
              or drag and drop file
            </p>
          </div>
        </Label>
      )}

      {isLoading && (
        <div className="w-full cursor-pointer h-fit p-5 rounded-[6px] border-[#E4E4E7] border-[1px] flex items-center gap-6 mx-auto">
          <Image
            src="/assets/images/dashboard/fileIcon.svg"
            width={50}
            height={50}
            alt="file icon"
          />

          <div className="flex flex-col">
            <h2 className="text-[#344054] font-[500] text-[14px]">
              {fileSelectedText}
            </h2>
            <p className="text-[#344054] font-[400] text-[14px]">{fileSize}</p>
            <Loader height="h-fit" />
          </div>
        </div>
      )}

      {fileUrl.length > 1 && (
        <div className="w-full cursor-pointer h-fit p-5 rounded-[6px] border-[#E4E4E7] border-[1px] flex items-center gap-6 mx-auto">
          <Image
            src="/assets/images/dashboard/fileIcon.svg"
            width={50}
            height={50}
            alt="file icon"
          />

          <div className="flex flex-col">
            <a
              href={fileUrl}
              target="_blank"
              className="text-[#344054] font-[500] text-[14px] hover:underline"
            >
              {fileSelectedText}
            </a>
            <p className="text-[#344054] font-[400] text-[14px]">{fileSize}</p>
          </div>

          <button
            disabled={disabled}
            className="ml-auto disabled:cursor-not-allowed"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              setFileUrl("");
              getFileAUrl && getFileAUrl("");
              setFileSelectedText("Click to upload");
              setFileSize("");
              getFileSize && getFileSize("");
              setIsLoading(false);
              getUploadStatus && getUploadStatus(false);
            }}
          >
            <Trash className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export const DocumentCUpload = ({
  getFileUrl,
  getUploadStatus,
  defaultText,
  getFileSize,
  defaultFileUrl,
  disabled,
  xkey,
}: Props) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileSelectedText, setFileSelectedText] = useState<string>(
    defaultText ?? "Click to upload"
  );
  const [fileSize, setFileSize] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string>(defaultFileUrl ?? "");

  useEffect(() => {
    if (defaultFileUrl) {
      setFileUrl(defaultFileUrl);
    }
  }, [defaultFileUrl]);

  const handleDragLeave = (e: React.DragEvent<any>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent<any>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    setIsLoading(true);
    getUploadStatus && getUploadStatus(true);

    e.preventDefault();

    const token = localStorage.getItem("token") as string;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFileSelectedText(droppedFile.name);
      setFileSize(formatFileSize(droppedFile.size));
      getFileSize && getFileSize(formatFileSize(droppedFile.size));

      const formData = new FormData();

      formData.append("document", droppedFile);

      const fileUrl = await handleDocumentUpload(formData, token);

      setDragActive(false);
      setFileUrl(fileUrl);
      getFileUrl && getFileUrl(fileUrl);
      setIsLoading(false);
      getUploadStatus && getUploadStatus(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();
    setIsLoading(true);

    getUploadStatus && getUploadStatus(true);

    const file = event.target?.files?.[0];
    const token = localStorage.getItem("token") as string;

    if (file) {
      setFileSelectedText(file.name);
      setFileSize(formatFileSize(file.size));
      getFileSize && getFileSize(formatFileSize(file.size));

      const formData = new FormData();

      formData.append("document", file);

      const fileUrl = await handleDocumentUpload(formData, token);

      setFileUrl(fileUrl);
      getFileUrl && getFileUrl(fileUrl);
      getUploadStatus && getUploadStatus(false);
      setIsLoading(false);
    } else {
      setFileSelectedText("Click to upload");
    }
  };

  return (
    <div
      className={`${isLoading && "rounded-lg flex flex-col gap-5"} ${
        fileUrl.length > 1 && "border-dotted rounded-lg flex flex-col gap-5"
      } flex flex-col gap-5`}
      key={xkey}
    >
      {fileUrl.length < 1 && (
        <Label
          aria-disabled={true}
          htmlFor="uploadDocument"
          className={`w-full  ${
            isLoading || fileUrl.length > 1 || disabled
              ? "cursor-not-allowed"
              : "cursor-pointer"
          }  h-fit p-5 rounded-[6px] border-[#E4E4E7] border-[1px] flex items-center flex-col justify-center gap-3 mx-auto ${
            dragActive && "border-dotted border-2 border-sky-500"
          } `}
          onDrop={(e) =>
            !isLoading && fileUrl.length <= 1 && !disabled && handleDrop(e)
          }
          onDragLeave={(e) =>
            !isLoading && fileUrl.length <= 1 && !disabled && handleDragLeave(e)
          }
          onDragOver={(e) =>
            !isLoading && fileUrl.length <= 1 && !disabled && handleDragOver(e)
          }
          onDragEnter={(e) =>
            !isLoading && fileUrl.length <= 1 && !disabled && handleDragOver(e)
          }
        >
          <div className="w-fit h-fit p-2 rounded-full bg-[#F2F4F7] border-[1px] flex items-center flex-col justify-center gap-3">
            <UploadIcon className="w-5 h-5" />
          </div>
          <div className="flex flex-col lg:flex-row flex-wrap text-center justify-center gap-1 items-center">
            <input
              onChange={async (e) =>
                !isLoading && fileUrl.length <= 1 && (await handleFileSelect(e))
              }
              id="uploadDocument"
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              style={{ display: "none" }}
              name="uploadedDocumentFile"
              disabled={isLoading || fileUrl.length > 1}
            />
            <Label
              htmlFor="uploadDocument"
              className="text-[14px] font-[500] text-[#2563EB]"
            >
              Click to upload
            </Label>
            <p className="text-[14px] font-[400] text-[#475467]">
              or drag and drop file
            </p>
          </div>
        </Label>
      )}

      {isLoading && (
        <div className="w-full cursor-pointer h-fit p-5 rounded-[6px] border-[#E4E4E7] border-[1px] flex items-center gap-6 mx-auto">
          <Image
            src="/assets/images/dashboard/fileIcon.svg"
            width={50}
            height={50}
            alt="file icon"
          />

          <div className="flex flex-col">
            <h2 className="text-[#344054] font-[500] text-[14px]">
              {fileSelectedText}
            </h2>
            <p className="text-[#344054] font-[400] text-[14px]">{fileSize}</p>
            <Loader height="h-fit" />
          </div>
        </div>
      )}

      {fileUrl.length > 1 && (
        <a
          href={fileUrl}
          target="_blank"
          className="w-full cursor-pointer h-fit p-5 rounded-[6px] border-[#E4E4E7] border-[1px] flex items-center gap-6 mx-auto"
        >
          <Image
            src="/assets/images/dashboard/fileIcon.svg"
            width={50}
            height={50}
            alt="file icon"
          />

          <div className="flex flex-col">
            <h2 className="text-[#344054] font-[500] text-[14px]">
              {fileSelectedText}
            </h2>
            <p className="text-[#344054] font-[400] text-[14px]">{fileSize}</p>
          </div>

          <button
            disabled={disabled}
            className="ml-auto disabled:cursor-not-allowed"
            onClick={() => {
              setFileUrl("");
              getFileUrl && getFileUrl("");
              setFileSelectedText("Click to upload");
              setFileSize("");
              getFileSize && getFileSize("");
              setIsLoading(false);
              getUploadStatus && getUploadStatus(false);
            }}
          >
            <Trash className="w-5 h-5" />
          </button>
        </a>
      )}
    </div>
  );
};

export default FileUpload;
