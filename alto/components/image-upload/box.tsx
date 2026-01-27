import { useMemo, useState } from "react";

import { cn } from "@/lib";

import { StaticImage } from "../static-image";
import ImageUpload, { UploadValue } from "./upload";

type Props = {
  callback?: (value: UploadValue) => void;
  rounded?: boolean;
  className?: string;
  defaultValue?: string | File;
  disabled?: boolean;
  center?: boolean;
};

const ImageUploader = ({
  rounded,
  callback,
  className,
  defaultValue,
  disabled,
  center = true,
}: Props) => {
  const [preview, setPreview] = useState<string | string[]>("");

  const getUploadResult = (img: UploadValue) => {
    callback?.(img);
    setPreview(img.preview as string);
  };

  const defaultValueUrl = useMemo(() => {
    if (defaultValue && typeof defaultValue === "object") {
      return URL?.createObjectURL(defaultValue);
    } else {
      return defaultValue;
    }
  }, [defaultValue]);

  return (
    <ImageUpload
      onFinish={(value: UploadValue) => getUploadResult(value)}
      id="single-image"
      center={center}
      disabled={disabled}
    >
      <div
        className={cn(
          "relative rounded-xl border border-light-grey-outline dark:border-dark-grey-outline dark:bg-dark-bg-color h-[218px] w-[218px]",
          rounded && "rounded-full",
          className,
        )}
      >
        {((preview && typeof preview === "string") || !!defaultValue) && (
          <StaticImage
            className={cn(
              "absolute left-0 top-0 z-[1] h-[inherit] min-h-[inherit] w-[inherit] min-w-[inherit] rounded-xl opacity-100",
              rounded && "rounded-full",
            )}
            src={(preview || defaultValueUrl) as string}
            imageClassName={cn(
              "object-cover",
              !disabled &&
                " hover:opacity-40 transition-opacity duration-300 ease-in-out",
            )}
            alt="uploaded image"
          />
        )}
        {!disabled && (
          <div className="absolute left-0 top-0 z-0 flex h-full w-full items-center justify-center text-xs">
            Upload Image +
          </div>
        )}
      </div>
    </ImageUpload>
  );
};

export default ImageUploader;
