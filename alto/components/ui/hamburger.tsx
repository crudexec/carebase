import { cva } from "class-variance-authority";
import React, { FC } from "react";

import { cn } from "@/lib";

const style = cva(
  "h-0.5 transition-all duration-300 ease-in-out bg-foreground",
  {
    variants: {
      style: {
        t1: "transform rotate-45 translate-y-2",
        t2: "transform -rotate-45 -translate-y-1.5",
        t3: "opacity-0",
        default: "",
      },
    },
  },
);

type Props = {
  toggleNav: () => void;
  opened: boolean;
  className?: string;
};

export const Burger: FC<Props> = ({ toggleNav, opened, className }) => {
  return (
    <div className={cn("cursor-pointer bg-transparent", className)}>
      <div
        className="flex justify-center w-5 flex-col space-y-[5px]"
        onClick={toggleNav}
      >
        <div className={style({ style: opened ? "t1" : "default" })} />
        <div className={style({ style: opened ? "t3" : "default" })} />
        <div className={style({ style: opened ? "t2" : "default" })} />
      </div>
    </div>
  );
};
