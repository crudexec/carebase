import {
  DotsHorizontalIcon,
  Pencil2Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useRouter } from "next-nprogress-bar";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../../ui";

type ActionCellProps = {
  callback: (action: "delete") => void;
  activeTab: string;
  id?: string;
};
export default function ActionsCell({
  callback,
  activeTab,
  id,
}: ActionCellProps) {
  const router = useRouter();

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
        {activeTab === "active" && (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/evv/${id}`);
              }}
            >
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
