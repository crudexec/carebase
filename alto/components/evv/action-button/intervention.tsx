import { DotsHorizontalIcon, Pencil2Icon } from "@radix-ui/react-icons";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui";

type ActionCellProps = {
  callback: (action: "edit" | "delete") => void;
};
export default function ActionsCell({ callback }: ActionCellProps) {
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
        <DropdownMenuItem onClick={() => callback("edit")}>
          <div className="flex items-center gap-2">
            <DropdownMenuShortcut>
              <Pencil2Icon />
            </DropdownMenuShortcut>
            Edit
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
