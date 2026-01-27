import React, { Dispatch, FC, SetStateAction } from "react";

import { patientProfileTabs } from "@/constants";

type SideBarProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onClick: (name: string) => void;
};

const Sidebar: FC<SideBarProps> = ({ open, setOpen, onClick }) => {
  return (
    <div>
      {open && (
        <div
          className={
            "h-screen absolute w-full flex-col z-20 lg:hidden dark:bg-scheme-blackbg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-5"
          }
        >
          <div className="flex space-y-8 flex-col">
            {patientProfileTabs.map((item) => (
              <div
                key={item.value}
                className={`cursor-pointer font-normal w-full border-b pb-1 border-b-border hover:border-b-foreground`}
                onClick={() => {
                  onClick(item.value);
                  setOpen(false);
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
