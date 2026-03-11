"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  Row,
  ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import FormSelect from "@/components/input-fields/FormSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { Step } from "./Goals";
import { FieldError, Merge, FieldErrorsImpl } from "react-hook-form";
import FormInput from "@/components/input-fields/FormInput";
import { TreatmentPlanType } from "./TreatmentPlanWrapper";
import FormTextArea from "@/components/input-fields/FormTextArea";

export type TableType = {
  id: string;
  taskAnalysis: string;
  baseline: string[];
  checked: boolean;
};

interface Props {
  data: TableType[];
  onStepChange: (goalIndex: number, step: Step) => void;
  objective_term_steps: Step[];
  index: number;
  errors:
    | Merge<
        FieldError,
        (
          | Merge<
              FieldError,
              FieldErrorsImpl<{
                id: string;
                taskAnalysis: string;
                baseline: string;
                checked: boolean;
              }>
            >
          | undefined
        )[]
      >
    | undefined;
  formType: TreatmentPlanType;
}

const GoalsTable = ({
  data,
  onStepChange,
  objective_term_steps,
  index,
  errors,
  formType,
}: Props) => {
  const TableCheckbox: React.FC<{ row: Row<TableType> }> = ({ row }) => {
    const handleCheckboxChange = (checked: boolean) => {
      const updatedStep: Step = {
        id: row.original.id,
        taskAnalysis: row.original.taskAnalysis,
        baseline:
          objective_term_steps?.find((step) => step.id === row.original.id)
            ?.baseline || "",
        checked: checked,
      };
      onStepChange(index, updatedStep);
    };

    const checkboxError = errors?.[row.index]?.message;

    return (
      <Checkbox
        data-testid={`goals-${index}-table-${row.original.id}-checkbox`}
        checked={objective_term_steps?.some(
          (step) =>
            step.taskAnalysis === row.original.taskAnalysis && step.checked
        )}
        onCheckedChange={(checked: boolean) => {
          handleCheckboxChange(checked);
        }}
        className={checkboxError ? "border-red-500" : ""}
      />
    );
  };

  const TableBaselineSelector: React.FC<{ row: Row<TableType> }> = ({
    row,
  }) => {
    const handleBaselineChange = (value: string) => {
      const updatedStep: Step = {
        id: row.original.id,
        taskAnalysis: row.original.taskAnalysis,
        baseline: value,
        checked: true,
      };
      onStepChange(index, updatedStep);
    };

    const options = row.original.baseline.map((item) => ({
      label: item,
      value: item,
    }));

    const baselineError = errors?.[row.index]?.message ? true : false;

    return (
      <FormSelect
        labelText=""
        placeholder="Select an option"
        selectContent={options}
        onValueChange={handleBaselineChange}
        value={
          objective_term_steps?.find(
            (step) => step.taskAnalysis === row.original.taskAnalysis
          )?.baseline || ""
        }
        isError={baselineError}
        data-testid={`goals-${index}-table-${row.original.id}-baseline`}
      />
    );
  };

  const TableStrategyInput: React.FC<{ row: Row<TableType> }> = React.memo(
    ({ row }) => {
      const [localValue, setLocalValue] = React.useState(
        objective_term_steps?.find(
          (step) => step.taskAnalysis === row.original.taskAnalysis
        )?.baseline || ""
      );

      const handleStrategyChange = (value: string) => {
        setLocalValue(value);
        const updatedStep: Step = {
          id: row.original.id,
          taskAnalysis: row.original.taskAnalysis,
          baseline: value,
          checked: value ? true : false,
        };
        onStepChange(index, updatedStep);
      };

      const baselineError = errors?.[row.index]?.message ? true : false;

      return (
        <FormTextArea
          labelText=""
          placeholder="Enter here"
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={() => handleStrategyChange(localValue)}
          value={localValue}
          isError={baselineError}
          name="strategy"
          data-testid={`goals-${index}-table-${row.original.id}-strategy`}
        />
      );
    }
  );

  TableStrategyInput.displayName = "TableStrategyInput";

  const columns = React.useMemo<ColumnDef<TableType>[]>(
    () => [
      {
        accessorKey: "selectStrategy",
        header: formType === "fc" ? "Select Strategy" : "Select Step",
        cell: ({ row }: { row: Row<TableType> }) => (
          <div className="flex justify-start">
            <TableCheckbox row={row} />
          </div>
        ),
      },
      {
        accessorKey: "teachingMethods",
        header:
          formType === "fc" ? "Teaching Methods/ Strategies" : "Task Analysis",
        cell: ({ row }: { row: Row<TableType> }) => (
          <div data-testid={`goals-${index}-table-${row.original.id}-name`}>
            {row.original.taskAnalysis}
          </div>
        ),
      },
      {
        accessorKey: "specificStrategies",
        header: formType === "fc" ? "Specific Strategies" : "Baseline",
        cell: ({ row }: { row: Row<TableType> }) => (
          <div>
            {formType === "fc" ? (
              <TableStrategyInput row={row} />
            ) : (
              <TableBaselineSelector row={row} />
            )}
          </div>
        ),
      },
    ],
    [objective_term_steps, errors, onStepChange, index, formType]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="relative w-full border rounded-lg">
      <div className="overflow-x-auto">
        <Table isForm>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} isForm>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} isForm>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {!table.getRowModel().rows?.length && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default GoalsTable;
