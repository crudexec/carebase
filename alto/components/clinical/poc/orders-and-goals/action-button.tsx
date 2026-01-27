import {
  DotsHorizontalIcon,
  EyeOpenIcon,
  Pencil2Icon,
  TrashIcon,
} from "@radix-ui/react-icons";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../../../ui";

type ActionCellProps = {
  callback: (action: string) => void;
  activeTab: string;
};
export function ActionsCell({ callback, activeTab }: ActionCellProps) {
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
      <DropdownMenuContent
        align="end"
        className="w-[160px]"
        onClick={(e) => e.stopPropagation()}
      >
        <>
          <DropdownMenuItem onClick={() => callback("view")}>
            <div className="flex items-center gap-2">
              <DropdownMenuShortcut>
                <EyeOpenIcon />
              </DropdownMenuShortcut>
              View
            </div>
          </DropdownMenuItem>{" "}
          {activeTab === "active" && (
            <DropdownMenuItem onClick={() => callback("edit")}>
              <div className="flex items-center gap-2">
                <DropdownMenuShortcut>
                  <Pencil2Icon className="size-4" />
                </DropdownMenuShortcut>
                Edit
              </div>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => callback("delete")}>
            <div className="flex items-center gap-2">
              <DropdownMenuShortcut>
                <TrashIcon />
              </DropdownMenuShortcut>
              {activeTab === "active" ? "Archive" : "Activate"}
            </div>
          </DropdownMenuItem>
        </>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
