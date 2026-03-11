import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import { FC, ReactNode } from "react";

interface Props {
  children: ReactNode;
  status: FormattedFormStatus | "Signed" | any;
}

const FormBadge: FC<Props> = ({ children, status }) => {
  let background: string;

  switch (status) {
    case "Not Filled":
      background = "#EF4444";

    case "Not Signed":
      background = "#EF4444";

    case "Not Started":
      background = "#EF4444";

    case "Not Submitted":
      background = "#EF4444";

      break;
    case "In Progress":
      background = "#F79009";

      break;
    case "Awaiting Approval":
      background = "gray";

      break;
    case "Approved":
      background = "green";
      break;

    case "Submitted":
      background = "green";
      break;

    case "Signed":
      background = "green";
      break;

    case "Completed":
      background = "#12B76A";
      break;

    case "Correction Required":
      background = "#e5863e";

      break;
    case "Active":
      background = "#12B76A";

      break;
    case "Inactive":
      background = "#64748B";

      break;
    case "Not Admitted":
      background = "red";

      break;
    case "New Intake":
      background = "#2563EB";

      break;
    case "Draft":
      background = "gray";
      break;

    case "Disengage":
      background = "#F79009";
      break;

    case "Not Sent":
      background = "#F79009";
      break;

    case "Signed":
      background = "green";
      break;

    case "Awaiting Signature":
      background = "#2563EB";
      break;

    default:
      background = "#2563EB";
      break;
  }

  return (
    <span
      className="px-[10px] py-[2px] text-[12px] font-[600] text-[#FAFAFA] w-fit h-fit rounded-full"
      style={{ backgroundColor: background }}
    >
      {children}
    </span>
  );
};

export default FormBadge;
