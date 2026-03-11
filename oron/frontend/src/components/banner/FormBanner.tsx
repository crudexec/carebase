import { FC } from "react";
import Image from "next/image";
import { DownloadIcon } from "lucide-react";

interface Props {
  text: string;
  variant?: "success" | "warning";
  downloadLink?: string;
}

const FormBanner: FC<Props> = ({ text, variant, downloadLink }) => {
  if (variant === "success") {
    return (
      <div className="flex flex-col gap-3 p-5 border-[2px] border-[#6CE9A6] bg-[#F6FEF9] rounded-[8px]">
        <div className="flex gap-3 items-start">
          <Image
            src="/assets/images/dashboard/successIcon.svg"
            width={17}
            height={17}
            alt="info icon"
            className="mt-1"
          />
          <p className="text-[14px] font-[400] text-[#027A48]">{text}</p>
        </div>

        {downloadLink && (
          <a
            href={downloadLink}
            download
            target="_blank"
            className="text-[#027A48] text-[14px] font-[600] flex items-center gap-3 hover:underline"
          >
            <DownloadIcon className="text-[#027A48] w-5 h-5" />

            <span>Download</span>
          </a>
        )}
      </div>
    );
  }

  if (variant === "warning") {
    return (
      <div className="flex flex-col gap-3 p-5 border-[2px] border-[#FEC84B] bg-[#FFFCF5] rounded-[8px]">
        <div className="flex gap-3 items-start">
          <Image
            src="/assets/images/dashboard/warningIcon.svg"
            width={17}
            height={17}
            alt="info icon"
            className="mt-1"
          />
          <p className="text-[14px] font-[400] text-[#B54708]">{text}</p>
        </div>

        {downloadLink && (
          <a
            href={downloadLink}
            download
            target="_blank"
            className="text-[#B54708] text-[14px] font-[600] flex items-center gap-3 hover:underline"
          >
            <DownloadIcon className="text-[#B54708] w-5 h-5" />

            <span>Download</span>
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-3 flex-col p-5 border-[2px] border-[#8FB2FF] rounded-[8px]">
      <div className="flex gap-3 items-start">
        <Image
          src="/assets/images/dashboard/infoIcon.svg"
          width={17}
          height={17}
          alt="info icon"
          className=""
        />
        <p className="text-[14px] font-[400] text-[#1A48AD]">{text}</p>
      </div>

      {downloadLink && (
        <a
          href={downloadLink}
          download
          target="_blank"
          className="text-[#1A48AD] text-[14px] font-[600] flex items-center gap-3 hover:underline"
        >
          <DownloadIcon className="text-[#1A48AD] w-5 h-5" />

          <span>Download</span>
        </a>
      )}
    </div>
  );
};

export default FormBanner;
