"use client";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import ReactSignatureCanvas from "react-signature-canvas";

import { StaticImage } from "@/components/static-image";
import { Button } from "@/components/ui";
import { useClearSignature, useUploadSignature } from "@/hooks";
import { uploadFile } from "@/lib";
import { ObjectData } from "@/types";

const Signature = ({
  refresh,
  onClose,
  signature,
  mediaId,
  url,
  uploadData,
}: {
  refresh: (data?: ObjectData) => void;
  onClose: () => void;
  url: string;
  uploadData: ObjectData;
  signature: string;
  mediaId: string;
}) => {
  const [loading, setLoading] = useState(false);
  const sigCanvas = useRef({} as ReactSignatureCanvas);
  const [signatureBlob, setSignatureBlob] = useState<Blob | null>(null);
  const { data, trigger, isMutating } = useUploadSignature(url);
  const {
    data: deleteResponse,
    trigger: clearSignature,
    isMutating: isDeletingSignature,
  } = useClearSignature();

  const handleSignature = async () => {
    sigCanvas.current.getTrimmedCanvas().toBlob(async (blob) => {
      if (blob === null) {
        throw new Error("Conversion of canvas data to blob failed.");
      }
      setSignatureBlob(blob);
    });
  };

  const handleSubmit = async () => {
    if (signatureBlob) {
      setLoading(true);
      const { mediaId } = await uploadFile(
        signatureBlob as File,
        "forms",
        "png",
      );
      trigger({ mediaId, ...uploadData });
      setLoading(false);
    }
  };

  const handleClearSignature = async () => {
    clearSignature({ mediaId: mediaId as string });
  };

  React.useEffect(() => {
    if (data?.success) {
      toast.success(`Success|${data?.message}`);
      refresh(data?.data);
      onClose();
    } else if (deleteResponse?.success) {
      toast.success(`Success|${deleteResponse?.message}`);
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, deleteResponse]);

  return (
    <div>
      <div className="relative h-[300px] w-[100%]">
        <div className="absolute h-[100%] w-[100%] border rounded-md mb-[10px]">
          {signature ? (
            <div className="h-[300px] w-[552px] flex items-center justify-center rounded-lg border-border">
              <StaticImage
                className={
                  "h-[inherit] w-[inherit] flex items-center justify-center"
                }
                src={signature}
                imageClassName={"object-contain"}
                alt="uploaded image"
                fill={false}
              />
            </div>
          ) : (
            <ReactSignatureCanvas
              onEnd={handleSignature}
              ref={sigCanvas}
              penColor="blue"
              canvasProps={{
                width: "auto",
                height: 300,
                className: "sigCanvas",
              }}
            />
          )}
        </div>
      </div>
      <div className="flex justify-between">
        <Button
          className="mt-4"
          onClick={() => {
            if (signature) {
              handleClearSignature();
            } else {
              sigCanvas.current.clear();
              setSignatureBlob(null);
            }
          }}
          loading={isDeletingSignature}
          disabled={isDeletingSignature || isMutating || loading}
          type="button"
        >
          Clear Signature
        </Button>
        <Button
          className="mt-4"
          loading={loading || isMutating}
          disabled={loading || isMutating || isDeletingSignature}
          onClick={handleSubmit}
          type="button"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export { Signature };
