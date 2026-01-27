import { ChangeEvent, FC } from "react";

import { cn } from "@/lib";

export type UploadValue = {
  preview: string | { file: File; preview: string }[];
  value: File | File[];
};

type Props = {
  children: React.ReactNode;
  onFinish: (file: UploadValue) => void;
  multiple?: boolean;
  required?: boolean;
  id?: string;
  center?: boolean;
  button?: boolean;
  accept?: string;
  disabled?: boolean;
};

const ImageUpload: FC<Props> = ({
  children,
  multiple,
  onFinish,
  required,
  center,
  button,
  disabled,
  accept = "image/*",
  id = "image-upload",
}) => {
  const onUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    let objectUrl;
    if (multiple) {
      const files = event.target.files as FileList;
      const filesArray = Array.from(files);
      objectUrl = filesArray.map((file) => ({
        preview: URL?.createObjectURL(file),
        file,
      }));
      onFinish({ preview: objectUrl, value: filesArray });
      return;
    }
    const file = event.target.files?.[0] as File;
    objectUrl = URL?.createObjectURL(file);
    onFinish({ preview: objectUrl, value: file });
  };

  return (
    <div style={{ width: "fit-content" }} className={cn(center && "mx-auto")}>
      {!button ? (
        <label htmlFor={id} role={!disabled ? "button" : ""}>
          {children}
        </label>
      ) : (
        children
      )}
      <input
        onChange={onUpload}
        type="file"
        accept={accept}
        id={id}
        style={{ display: "none" }}
        required={required}
        multiple={multiple}
        disabled={disabled}
      />
    </div>
  );
};

export default ImageUpload;
