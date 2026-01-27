import React from "react";

import { ISetState } from "@/types";

const Radio = ({
  setOption,
  option,
  title,
}: {
  setOption: ISetState<string>;
  option: string;
  title: string;
}) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className="border-2 h-[20px] w-[20px] rounded-full flex justify-center items-center cursor-pointer"
        onClick={() => setOption(title)}
      >
        <div
          className={`${option === title && "bg-primary"} h-3 w-3 rounded-full`}
        />
      </div>
      <p>{title}</p>
    </div>
  );
};

export default Radio;
