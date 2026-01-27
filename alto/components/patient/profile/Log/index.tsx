import { Textarea } from "@/components/ui";
import { cn } from "@/lib";

const PatientLog = ({ value }: { value: string }) => {
  return (
    <div>
      <div className="md:px-8 px-2 bg-background border-b border-b-border text-white  py-4 mx-2 mb-4 sticky top-0 z-[1]">
        <p className="text-foreground uppercase font-semibold "> Patient Log</p>
      </div>
      <div className={cn("grid grid-cols-1 gap-x-7 md:px-8 px-4 items-end")}>
        <p className="opacity-65 text-sm mb-2">
          The application will automatically add notes to this log when certain
          significant data changes occur. You can also add your own notes as
          well.{" "}
        </p>
        <Textarea
          value={value}
          disabled
          className="disabled:opacity-100 resize-none"
        />
      </div>
    </div>
  );
};

export default PatientLog;
