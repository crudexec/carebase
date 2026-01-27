import { ImSpinner8 } from "react-icons/im";

import { cn } from "@/lib";

const AppLoader = ({
  loading = true,
  replace,
}: {
  loading?: boolean;
  replace?: boolean;
}) => {
  return loading ? (
    <div
      className={cn(
        "absolute top-0 left-0 w-full h-full bg-background/60 bg-opacity-70 flex items-center justify-center z-50 dark:!bg-opacity-10 text-primary dark:text-primary ",
        replace && "bg-background bg-opacity-100",
      )}
    >
      <ImSpinner8 className="animate-spin stroke-inherit" size={40} />
    </div>
  ) : (
    <></>
  );
};

export default AppLoader;
