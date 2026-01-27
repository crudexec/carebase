import {
  DotsHorizontalIcon,
  EyeOpenIcon,
  Pencil2Icon,
  TrashIcon,
} from "@radix-ui/react-icons";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type ActionCellProps = {
  callback: (action: "edit" | "delete" | "view" | "assign") => void;
  activeTab: string;
};
export default function ActionsCell({ callback, activeTab }: ActionCellProps) {
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
        <DropdownMenuItem onClick={() => callback("view")}>
          <div className="flex items-center gap-2">
            <DropdownMenuShortcut>
              <EyeOpenIcon />
            </DropdownMenuShortcut>
            View
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {activeTab !== "archived" && (
          <>
            <DropdownMenuItem onClick={() => callback("edit")}>
              <div className="flex items-center gap-2">
                <DropdownMenuShortcut>
                  <Pencil2Icon />
                </DropdownMenuShortcut>
                Edit
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => callback("delete")}>
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
