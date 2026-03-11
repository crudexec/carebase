import Button from "@/components/button/Button";
import Image from "next/image";

interface Props {
  title: string;
  description: string;
}

const NoActivity = ({ title, description }: Props) => {
  return (
    <div className="flex flex-col gap-5 items-center justify-center mt-20">
      <Image
        src="/assets/images/dashboard/noActivityIcon.svg"
        width={70}
        height={70}
        alt="activity icon"
      />

      <h3 className="text-[#101828] text-[16px] font-[600] text-center">
        {title}
      </h3>
      <h3 className="text-[#475467] text-[12px] font-[400] text-center w-[80%]">
        {description}
      </h3>
      <Button asLink={true} route="/onboarding/summary">
        Complete Onboarding
      </Button>
    </div>
  );
};

export default NoActivity;
