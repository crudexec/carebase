import Image from "next/image";

interface Props {
  background: string;
  clientName: string;
  date: string;
  startTime: string;
}

const ScheduleCard = ({ background, clientName, date, startTime }: Props) => {
  return (
    <div
      style={{
        backgroundColor: background,
      }}
      className="w-full cursor-pointer rounded-l-2xl h-[70px] shadow-sm border-[0.5px]"
    >
      <div className="w-[96%] h-full ml-auto bg-white transition-all duration-500 hover:bg-gray-50 flex gap-5 items-center">
        <Image
          src="/assets/images/avatar.svg"
          width={50}
          height={50}
          alt="avatar"
          className="ml-2"
        />

        <div className="flex flex-col gap-1">
          <h2 className="text-[16px] font-[600] text-black">{clientName}</h2>
          <h3 className="text-[12px] font-[400] text-[#64748B]">
            {date} | {startTime}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCard;
