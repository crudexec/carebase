import { DischargeSummary } from "@prisma/client";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import ReactSignatureCanvas from "react-signature-canvas";

import { StaticImage } from "@/components/static-image";
import { Button } from "@/components/ui";
import { useClearSignature } from "@/hooks";
import { uploadFile } from "@/lib";
import { ISetState } from "@/types";

const SummarySignature = ({
  setMediaId,
  summaryData,
  refresh,
}: {
  refresh: () => void;
  setMediaId: ISetState<string | undefined>;
  summaryData?: DischargeSummary & { signatureUrl?: string };
}) => {
  const [loading, setLoading] = useState(false);
  const sigCanvas = useRef({} as ReactSignatureCanvas);
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
      setLoading(true);
      const { mediaId } = await uploadFile(blob as File, "forms", "png");
      setMediaId(mediaId);
      setLoading(false);
    });
  };

  const handleClearSignature = async () => {
    clearSignature({ mediaId: summaryData?.mediaId as string });
    setMediaId(undefined);
  };

  React.useEffect(() => {
    if (deleteResponse?.success) {
      toast.success(`Success|${deleteResponse?.message}`);
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteResponse]);

  return (
    <div>
      <div className="relative h-[300px] w-[100%]">
        <div className="absolute h-[100%] w-[100%] border rounded-md mb-[10px]">
          {summaryData?.signatureUrl ? (
            <div className="h-[300px] w-[552px] flex items-center justify-center rounded-lg border-border">
              <StaticImage
                className={
                  "h-[inherit] w-[inherit] flex items-center justify-center"
                }
                src={summaryData?.signatureUrl}
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
          type="button"
          onClick={() => {
            if (summaryData?.signatureUrl) {
              handleClearSignature();
            } else {
              sigCanvas.current.clear();
            }
          }}
          loading={isDeletingSignature}
          disabled={isDeletingSignature || loading}
        >
          Clear Signature
        </Button>
      </div>
    </div>
  );
};

export default SummarySignature;
