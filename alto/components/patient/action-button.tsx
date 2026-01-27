import {
  DotsHorizontalIcon,
  ExitIcon,
  Pencil2Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { PrinterIcon } from "lucide-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui";

type ActionCellProps = {
  callback: (
    action: "edit" | "delete" | "view" | "assign" | "discharged",
  ) => void;
  activeTab: string;
  handlePrint: () => void;
};
export default function ActionsCell({
  callback,
  activeTab,
  handlePrint,
}: ActionCellProps) {
  return activeTab !== "archived" ? (
    <div
      className="flex items-center gap-4"
      onClick={(e) => e.stopPropagation()}
    >
      {(activeTab === "active" || activeTab === "discharged") && (
        <div role="button" onClick={handlePrint}>
          <PrinterIcon className=" size-4" />
        </div>
      )}
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
        <DropdownMenuContent
          align="end"
          className="w-[160px]"
          onClick={(e) => e.stopPropagation()}
        >
          <>
            {activeTab === "active" && (
              <DropdownMenuItem onClick={() => callback("discharged")}>
                <div className="flex items-center gap-2">
                  <DropdownMenuShortcut>
                    <ExitIcon className="size-4" />
                  </DropdownMenuShortcut>
                  Discharge
                </div>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={() => callback("edit")}>
              <div className="flex items-center gap-2">
                <DropdownMenuShortcut>
                  <Pencil2Icon className="size-4" />
                </DropdownMenuShortcut>
                Edit
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => callback("delete")}>
              <div className="flex items-center gap-2">
                <DropdownMenuShortcut>
                  <TrashIcon />
                </DropdownMenuShortcut>
                Archive
              </div>
            </DropdownMenuItem>
          </>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <></>
  );
}
