"use client";

import { ColumnDef } from "@tanstack/react-table";
import FormSelect from "@/components/input-fields/FormSelect";

export type StepThreeTableType = {
  id: string;
  taskAnalysis: string;
  response: { label: string; value: string }[];
  promptUsed: { label: string; value: string }[];
  opportunities: { label: string; value: string }[];
  success: { label: string; value: string }[];
};

export const columns: ColumnDef<StepThreeTableType>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <div>Steps</div>,
    cell: ({ row }) => <div>{row.getValue("id")}</div>,
  },
  {
    accessorKey: "taskAnalysis",
    header: ({ column }) => <div>Task Analysis</div>,
    cell: ({ row }) => <div>{row.getValue("taskAnalysis")}</div>,
  },
  {
    accessorKey: "response",
    header: ({ column }) => <div>Response?</div>,
    cell: ({ row }) => {
      return (
        <div>
          <FormSelect
            name="response"
            labelText=""
            placeholder="Select"
            selectContent={row.getValue("response")}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "promptUsed",
    header: ({ column }) => <div>Promot Used</div>,
    cell: ({ row }) => {
      return (
        <div>
          <FormSelect
            name="promptUsed"
            labelText=""
            placeholder="Select"
            selectContent={row.getValue("promptUsed")}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "opportunities",
    header: ({ column }) => <div>Opportunities</div>,
    cell: ({ row }) => {
      return (
        <div>
          <FormSelect
            name="opportunities"
            labelText=""
            placeholder="Select"
            selectContent={row.getValue("opportunities")}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "success",
    header: ({ column }) => <div>Success</div>,
    cell: ({ row }) => {
      return (
        <div>
          <FormSelect
            name="success"
            labelText=""
            placeholder="Select"
            selectContent={row.getValue("success")}
          />
        </div>
      );
    },
  },
];
