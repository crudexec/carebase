import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { Button as HeaderButton } from "@/components/ui/button";
import FormBadge from "@/components/badge/FormBadge";

export interface GoalAssessmentTableTypes {
  id: string;
  document: string;
  treatmentPlan: string;
  status: string;
  dateCreated: string;
  lastModified: string;
  route: string;
}

export const goalAssessmentColumns: ColumnDef<GoalAssessmentTableTypes>[] = [
  {
    accessorKey: "document",
    header: ({ column }) => (
      <HeaderButton
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Goal Assessment</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </HeaderButton>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex gap-2 items-center">
          <p className="capitalize text-[#2563EB] font-[500] text-[14px]">
            {row.getValue("document")}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "treatmentPlan",
    header: ({ column }) => (
      <HeaderButton
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Treatment Plan</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </HeaderButton>
    ),
    cell: ({ row }) => {
      return (
        <div className="capitalize">
          {row.getValue("treatmentPlan") ? row.getValue("treatmentPlan") : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <HeaderButton
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Status</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </HeaderButton>
    ),
    cell: ({ row }) => {
      return (
        <FormBadge status={row.getValue("status")}>
          {row.getValue("status")}
        </FormBadge>
      );
    },
  },
  {
    accessorKey: "dateCreated",
    header: ({ column }) => (
      <HeaderButton
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Date Created</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </HeaderButton>
    ),
    cell: ({ row }) => {
      return (
        <div className="capitalize">
          {row.getValue("dateCreated") ? row.getValue("dateCreated") : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "lastModified",
    header: ({ column }) => (
      <HeaderButton
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0"
      >
        <span>Last Modified</span>
        <CaretSortIcon
          className={`h-4 w-4 ml-1 ${
            column.getIsSorted() === "asc" ? "transform rotate-180" : ""
          }`}
        />
      </HeaderButton>
    ),
    cell: ({ row }) => {
      return (
        <div className="capitalize">
          {row.getValue("lastModified") ? row.getValue("lastModified") : "-"}
        </div>
      );
    },
  },
];
