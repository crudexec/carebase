import { Media } from "@prisma/client";
import { FileIcon } from "@radix-ui/react-icons";
import { XIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ACCEPTED_IMAGE_TYPES } from "@/constants";
import { cn } from "@/lib";

import { StaticImage } from "../static-image";
import { Button, Card, CardDescription, CardHeader, CardTitle } from "../ui";
import ImageUpload, { UploadValue } from "./upload";

type Props = {
  callback: (value: File[]) => void;
  className?: string;
  defaultValues?: (Media | File)[];
  disabled?: boolean;
};

type PreviewArray = {
  file?: File;
  preview: string;
  id?: string;
  fileType?: string | null;
  mediaId?: string | null;
  size?: number | null;
  fileName?: string | null;
};

const getImageSize = (size: number) => {
  return (size / 1000000).toFixed(2);
};

const MultipleImageUploader = ({
  callback,
  defaultValues,
  disabled,
}: Props) => {
  const [previews, setPreviews] = useState<PreviewArray[]>([]);
  const [values, setValues] = useState<(File | PreviewArray)[]>([]);

  const getUploadResult = (img: UploadValue) => {
    const updatedValues = [...values];
    updatedValues.push(...(img.value as File[]));
    setValues(updatedValues);
    callback(updatedValues as File[]);
    setPreviews((prevPreviews) => {
      return [...prevPreviews, ...(img.preview as PreviewArray[])];
    });
  };

  const removeImage = (index: number) => {
    const updatedValues = [...values];
    updatedValues.splice(index, 1);
    setValues(updatedValues);
    callback(updatedValues as File[]);
    setPreviews((prevPreviews) => {
      const updatedPreviews = [...prevPreviews];
      updatedPreviews.splice(index, 1);
      return updatedPreviews;
    });
  };

  const getPreview = useCallback((file: File) => {
    return file.type?.split("/")[0] === "image"
      ? URL?.createObjectURL(file)
      : "";
  }, []);

  useEffect(() => {
    if (defaultValues?.length) {
      const DefaultValues = defaultValues.map((file) => {
        if ((file as Media)?.mediaId) {
          return { ...file, preview: (file as Media).mediaId ?? "" };
        } else {
          return { file: file as File, preview: getPreview(file as File) };
        }
      });
      const updatedValues = [...values];
      updatedValues.push(...(defaultValues as File[]));
      setValues(updatedValues);
      callback(updatedValues as File[]);
      setPreviews(DefaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <ImageUpload
        onFinish={(value: UploadValue) => getUploadResult(value)}
        id="multiple-images"
        multiple
        button
        accept="image/*,.pdf,.gif,.zip"
        disabled={disabled}
      >
        <Button variant={"outline"} type="button" disabled={disabled}>
          <label htmlFor="multiple-images" className="cursor-pointer">
            Click to Add Attachment
          </label>
        </Button>
      </ImageUpload>

      <div className="grid md:grid-cols-2 gap-4 mt-2">
        {previews &&
          previews?.map((image, index) => (
            <Card className="w-full max-w-sm relative p-2" key={index}>
              <CardHeader className="flex flex-row items-center p-0 gap-4">
                <div className="min-h-[50px] min-w-[50px] relative">
                  {ACCEPTED_IMAGE_TYPES.includes(
                    image?.file?.type || image.fileType || "",
                  ) ? (
                    <StaticImage
                      className={cn(
                        "h-[inherit] min-h-[inherit] w-[inherit] min-w-[inherit] rounded-lg",
                      )}
                      imageClassName="object-cover"
                      src={image?.preview}
                      alt="uploaded images"
                    />
                  ) : (
                    <FileIcon className="h-[inherit] min-h-[inherit] w-[inherit] min-w-[inherit]" />
                  )}
                </div>
                <div className="grid gap-1">
                  <CardTitle className="text-base line-clamp-1 capitalize">
                    {image?.file?.name || image?.fileName}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {getImageSize(image?.file?.size || (image.size as number))}{" "}
                    MB •{" "}
                    {(image?.file?.type || image.fileType || "").split("/")[1]}
                  </CardDescription>
                </div>
              </CardHeader>
              {!disabled && (
                <div
                  className="ml-auto absolute -top-[6px] -right-2"
                  role="button"
                  onClick={() => removeImage(index)}
                >
                  <XIcon className="size-4 text-[red]" />
                </div>
              )}
            </Card>
          ))}
      </div>
    </div>
  );
};

export default MultipleImageUploader;
