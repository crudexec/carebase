"use client";

import { FC } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface Props {
  buttonText: string;
  "data-testid"?: string;
}

const SubmitButton: FC<Props> = ({ buttonText, "data-testid": dataTestId }) => {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <button
        disabled={pending}
        type="submit"
        className="w-full bg-[#2563EB] disabled:bg-[#2564eb8d] disabled:cursor-not-allowed rounded-[6px] p-4 text-white hover:bg-[#2564ebc1] font-[500] flex items-center gap-5 justify-center"
        data-testid={dataTestId}
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        {buttonText}
      </button>
    );
  }

  return (
    <button
      type="submit"
      className="w-full bg-[#2563EB] rounded-[6px] p-4 text-white hover:bg-[#2564ebc1] font-[500]"
      data-testid={dataTestId}
    >
      {buttonText}
    </button>
  );
};

export default SubmitButton;
