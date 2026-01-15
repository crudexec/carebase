"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, X, Image as ImageIcon, File } from "lucide-react";
import { Button } from "./button";

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  value?: File | File[] | null;
  onChange?: (files: File | File[] | null) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  placeholder?: string;
  preview?: boolean;
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      accept,
      multiple = false,
      maxSize,
      value,
      onChange,
      onError,
      disabled,
      error,
      className,
      placeholder = "Click or drag to upload",
      preview = true,
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);

    // Merge refs
    React.useImperativeHandle(ref, () => inputRef.current!);

    // Generate preview URLs for image files
    React.useEffect(() => {
      if (!preview || !value) {
        setPreviewUrls([]);
        return;
      }

      const files = Array.isArray(value) ? value : [value];
      const urls: string[] = [];

      files.forEach((file) => {
        if (file.type.startsWith("image/")) {
          urls.push(URL.createObjectURL(file));
        }
      });

      setPreviewUrls(urls);

      return () => {
        urls.forEach((url) => URL.revokeObjectURL(url));
      };
    }, [value, preview]);

    const handleFiles = (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const files = Array.from(fileList);

      // Validate file size
      if (maxSize) {
        const oversized = files.find((f) => f.size > maxSize);
        if (oversized) {
          onError?.(
            `File "${oversized.name}" exceeds maximum size of ${Math.round(
              maxSize / 1024 / 1024
            )}MB`
          );
          return;
        }
      }

      if (multiple) {
        onChange?.(files);
      } else {
        onChange?.(files[0]);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled) handleFiles(e.dataTransfer.files);
    };

    const handleClick = () => {
      if (!disabled) inputRef.current?.click();
    };

    const handleRemove = (index?: number) => {
      if (multiple && Array.isArray(value) && typeof index === "number") {
        const newFiles = [...value];
        newFiles.splice(index, 1);
        onChange?.(newFiles.length > 0 ? newFiles : null);
      } else {
        onChange?.(null);
      }
    };

    const files = value ? (Array.isArray(value) ? value : [value]) : [];

    return (
      <div className={cn("space-y-2", className)}>
        {/* Drop zone */}
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-4 transition-all duration-150",
            isDragging && "border-primary bg-primary/5",
            error && "border-error",
            disabled && "cursor-not-allowed opacity-50",
            !isDragging && !error && "border-border hover:border-primary/50"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={(e) => handleFiles(e.target.files)}
            className="sr-only"
          />
          <Upload className="mb-2 h-8 w-8 text-foreground-tertiary" />
          <p className="text-sm text-foreground-secondary">{placeholder}</p>
          {accept && (
            <p className="mt-1 text-xs text-foreground-tertiary">
              Accepted: {accept}
            </p>
          )}
        </div>

        {/* File previews */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-md border border-border bg-background-secondary p-2"
              >
                {preview && previewUrls[index] ? (
                  <img
                    src={previewUrls[index]}
                    alt={file.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : file.type.startsWith("image/") ? (
                  <ImageIcon className="h-10 w-10 text-foreground-tertiary" />
                ) : (
                  <File className="h-10 w-10 text-foreground-tertiary" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm text-foreground">{file.name}</p>
                  <p className="text-xs text-foreground-tertiary">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(multiple ? index : undefined);
                  }}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);
FileUpload.displayName = "FileUpload";

export { FileUpload };
