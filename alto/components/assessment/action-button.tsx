import {
  DotsHorizontalIcon,
  EyeOpenIcon,
  Pencil2Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { SaveIcon } from "lucide-react";

import { PatientScheduleResponse } from "@/types";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui";

type ActionCellProps = {
  callback: (action: string) => void;
  activeTab: string;
  schedule?: PatientScheduleResponse;
  isQAManager?: boolean;
};
export default function ActionsCell({
  callback,
  isQAManager,
  activeTab,
  schedule,
}: ActionCellProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Open menu"
          variant="ghost"
          className="flex size-8 p-0 data-[state=open]:bg-muted"
          onClick={(e) => e.stopPropagation()}
        >
          <DotsHorizontalIcon className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {activeTab === "active" && !isQAManager && (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                callback("submit");
              }}
            >
              <div className="flex items-center gap-2">
                <DropdownMenuShortcut>
                  <SaveIcon className="size-4" />
                </DropdownMenuShortcut>
                Complete Assessment
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                callback("verify");
              }}
            >
              <div className="flex items-center gap-2">
                <DropdownMenuShortcut>
                  {schedule?.scheduleVisitVerification?.signature ? (
                    <EyeOpenIcon className="size-4" />
                  ) : (
                    <Pencil2Icon className="size-4" />
                  )}
                </DropdownMenuShortcut>
                {schedule?.scheduleVisitVerification?.signature
                  ? "View"
                  : "Verify"}{" "}
                EVV
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            callback("delete");
          }}
        >
          <div className="flex items-center gap-2">
            <DropdownMenuShortcut>
              <TrashIcon className=" size-4" />
            </DropdownMenuShortcut>
            {activeTab !== "archived" ? "Archive" : "Activate"}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
