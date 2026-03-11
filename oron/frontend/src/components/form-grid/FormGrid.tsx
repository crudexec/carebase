import { ReactNode } from "react";

const FormGrid = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-5">
      {children}
    </div>
  );
};

export default FormGrid;
