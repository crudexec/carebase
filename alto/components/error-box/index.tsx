import { GoAlert } from "react-icons/go";

import { capitalize } from "@/lib";

const ErrorBox = ({ message }: { message: string }) => {
  return (
    <div className="flex-start gap-1">
      <GoAlert className="text-red-500 text-sm" />
      <p className="text-red-500 text-xs ">{capitalize(message)}</p>
    </div>
  );
};

export default ErrorBox;
