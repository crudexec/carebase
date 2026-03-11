import Loader from "@/components/Loader";

interface Props {
  type:
    | "Not Filled"
    | "Awaiting Approval"
    | "Correction Required"
    | "Completed";
  number: string;
  percentage: number;
  chartColour: string;
  isLoading: boolean;
}

const StatCard = ({
  type,
  number,
  percentage,
  chartColour,
  isLoading,
}: Props) => {
  const gradientStyle = {
    width: "6rem",
    height: "6rem",
    borderRadius: "100%",
    background: `conic-gradient(${chartColour} 0%, ${chartColour} ${percentage}%, #EAECF0 ${percentage}% 100%)`,
  };

  if (isLoading) {
    return (
      <div className="w-full h-[125px] rounded-[12px] bg-white border-[1px] border-[#EAECF0] shadow-md hover:shadow-lg cursor-pointer transition-all duration-400 flex justify-between items-center p-5">
        <Loader height="h-fit" />
      </div>
    );
  }

  return (
    <div className="w-full h-[125px] rounded-[12px] bg-white border-[1px] border-[#EAECF0] shadow-md hover:shadow-lg cursor-pointer transition-all duration-400 flex justify-between items-center p-5">
      <div className="flex flex-col gap-2">
        <h4 className="text-[14px] text-[#64748B] font-[400]">{type}</h4>
        <h2 className="text-[30px] font-[600] text-[#101828]">{number}</h2>
      </div>

      <div
        className="relative min-w-24 min-h-24 rounded-full flex items-center justify-center transition-all duration-500"
        style={gradientStyle}
      >
        <div className="absolute bg-white rounded-full min-w-20 min-h-20 flex items-center justify-center p-1.5 text-[14px] font-[500] text-[#344054]">
          {percentage}%
        </div>
      </div>
    </div>
  );
};

export default StatCard;
