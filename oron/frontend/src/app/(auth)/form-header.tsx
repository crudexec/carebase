import { FC } from "react";

interface Props {
  heading: string;
  description: string;
}

const FormHeader: FC<Props> = ({ heading, description }) => {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[36px] font-[600] text-[#101828]">{heading}</h2>
      <p className="text-[16px] font-[400] text-[##475467]">{description}</p>
    </div>
  );
};

export default FormHeader;
