"use client";

import Image from "next/image";
import { FC } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Props {
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  completedSections: Set<number>;
  formSidebar: { id: number; name: string }[];
  visitForm?: boolean;
  restrictNavigation?: boolean;
  className?: string;
}

const SideNavigation: FC<Props> = ({
  currentIndex,
  handleChangeIndex,
  completedSections,
  formSidebar,
  visitForm,
  restrictNavigation,
  className,
}) => {
  return (
    <aside
      className={cn(
        "w-full md:w-[60vw] lg:w-[250px] lg:fixed xl:mt-10 bg-white flex flex-col gap-5 z-10 pb-0 lg:h-[60vh] overflow-auto",
        visitForm && "lg:h-[60vh]",
        className
      )}
    >
      <div className="lg:hidden mt-5">
        <Select
          onValueChange={(e) => {
            handleChangeIndex(parseInt(e));
          }}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue
              placeholder={
                formSidebar.find((item) => item.id === currentIndex)?.name
              }
            />
          </SelectTrigger>
          <SelectContent>
            {formSidebar.map((item) => (
              <SelectItem
                disabled={
                  item.id !== 1 &&
                  restrictNavigation &&
                  !completedSections.has(item.id - 1)
                }
                key={item.id}
                value={item.id.toString()}
              >
                <div className="flex justify-between items-center gap-7">
                  {item.name}
                  {completedSections.has(item.id) && (
                    <Image
                      src="/assets/images/dashboard/completed.svg"
                      width={15}
                      height={15}
                      alt="check mark"
                    />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ul className="w-full hidden lg:flex flex-col pb-10 gap-5 h-[300px] lg:pb-[100px] lg:overflow-y-auto flex-grow">
        {formSidebar.map((item) => (
          <button
            disabled={
              item.id !== 1 &&
              restrictNavigation &&
              !completedSections.has(item.id - 1)
            }
            onClick={() => handleChangeIndex(item.id)}
            key={item.id}
            className={`text-[16px] font-[600] w-full px-[12px] py-[10px] text-left hover:bg-[#e3e7f2] transition-all duration-100 flex items-center gap-5 justify-between rounded-[6px] ${
              currentIndex === item.id && "bg-[#e3e7f2] text-[#1A48AD]"
            }  disabled:cursor-not-allowed`}
          >
            {item.name}
            {completedSections.has(item.id) && (
              <Image
                src="/assets/images/dashboard/completed.svg"
                width={20}
                height={20}
                alt="check mark"
              />
            )}
          </button>
        ))}
      </ul>
    </aside>
  );
};

export default SideNavigation;
