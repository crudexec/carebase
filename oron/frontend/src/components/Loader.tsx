import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const Loader = ({
  height,
  className,
}: {
  height?: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "w-full flex items-center justify-center h-screen",
        height,
        className
      )}
    >
      <Loader2 className="w-5 h-5 animate-spin" />
    </div>
  );
};

export default Loader;
