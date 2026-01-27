"use client";
import { cva } from "class-variance-authority";
import toast, { resolveValue, Toaster } from "react-hot-toast";
import { FaCheck, FaExclamation } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { MdWarningAmber } from "react-icons/md";

import { capitalize, cn } from "@/lib";

export const toastStyles = cva(
  "px-4 py-[19px] w-[366px] flex items-center justify-between gap-3 rounded-2xl text-black border",
  {
    variants: {
      intent: {
        error: "bg-white dark:bg-black dark:text-white  border-red-500",
        success: "bg-white dark:bg-black dark:text-white  border-green-500",
        loading: "bg-white dark:bg-black dark:text-white  border-yellow-500",
        custom: "",
        blank: "",
      },
    },
    defaultVariants: {
      intent: "success",
    },
  },
);

export const Toast = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 1000,
      }}
      containerClassName="!top-[5px] !right-[5px]"
    >
      {(t) => {
        const str = resolveValue(t.message, t) as string;
        const [title, message] = str.split("|");
        return (
          <div className={`${toastStyles({ intent: t.type })}`}>
            <div className="flex items-center">
              <div
                className={cn(
                  "mr-4 rounded-full p-[6px]",
                  t.type === "success"
                    ? "bg-green-500"
                    : t.type === "loading"
                      ? "bg-yellow-500"
                      : "bg-red-500",
                )}
              >
                {t.type === "success" ? (
                  <FaCheck size={10} color="white" />
                ) : (
                  t.type === "error" && (
                    <FaExclamation size={10} color="white" />
                  )
                )}
                {t.type === "loading" && (
                  <MdWarningAmber size={12} color="white" />
                )}
              </div>
              <div className="flex flex-col dark:text-white">
                {message && <p className="text-[13px] font-bold">{title}</p>}
                <p className="text-[13px] font-normal text-[#71717a] dark:text-[#A1A1A1]">
                  {message ? capitalize(message) : capitalize(title)}
                </p>
              </div>
            </div>
            <div
              onClick={() => toast.remove(t.id)}
              className="cursor-pointer p-1"
            >
              <IoMdClose />
            </div>
          </div>
        );
      }}
    </Toaster>
  );
};
