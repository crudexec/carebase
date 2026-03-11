"use client";

import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ListFilter, Search, XIcon } from "lucide-react";
import { ChangeEvent, Dispatch, SetStateAction } from "react";

type Props = {
  sheetOpen: boolean;
  clients: { label: string; value: string }[];
  staffs: { label: string; value: string }[];
  handleFilterEvents: (
    clientName?: string,
    employeeName?: string,
    clientId?: string,
    employeeId?: string
  ) => Promise<void>;
  filterEventLoading: boolean;
  hasFiltered: boolean;
  setFilterValues: Dispatch<
    SetStateAction<{
      client: {
        label: string;
        value: string;
      };
      employee: {
        label: string;
        value: string;
      };
    }>
  >;
  filterValues: {
    client: {
      label: string;
      value: string;
    };
    employee: {
      label: string;
      value: string;
    };
  };
  handleEmployeeAndClientsSearch: (
    event: ChangeEvent<HTMLInputElement>,
    type: "employee" | "clients"
  ) => void;
  filteredEmployees: {
    label: string;
    value: string;
  }[];
  noOfEmployeesToDisplay: number;
  setNoOfEmployeesToDisplay: (value: SetStateAction<number>) => void;
  filteredClients: {
    label: string;
    value: string;
  }[];
  noOfClientsToDisplay: number;
  setNoOfClientsToDisplay: (value: SetStateAction<number>) => void;
  setHasFiltered: (value: SetStateAction<boolean>) => void;
  setSheetOpen: (value: SetStateAction<boolean>) => void;
  setFilteredEmployees: (
    value: SetStateAction<
      {
        label: string;
        value: string;
      }[]
    >
  ) => void;
  setFilteredClients: (
    value: SetStateAction<
      {
        label: string;
        value: string;
      }[]
    >
  ) => void;
};

const FilterSheet = ({
  sheetOpen,
  clients,
  staffs,
  handleFilterEvents,
  filterEventLoading,
  hasFiltered,
  setFilterValues,
  filterValues,
  handleEmployeeAndClientsSearch,
  filteredEmployees,
  noOfEmployeesToDisplay,
  setNoOfEmployeesToDisplay,
  filteredClients,
  noOfClientsToDisplay,
  setNoOfClientsToDisplay,
  setHasFiltered,
  setSheetOpen,
  setFilteredEmployees,
  setFilteredClients,
}: Props) => {
  return (
    <Sheet
      open={sheetOpen}
      onOpenChange={(e) => {
        if (
          e === true &&
          filterValues.employee.value.length === 0 &&
          filterValues.client.value.length === 0
        ) {
          setHasFiltered(false);
        }
        if (!filterEventLoading) {
          setSheetOpen(e);
        }

        if (e === false) {
          setFilteredEmployees(staffs);
          setFilteredClients(clients);
        }
      }}
    >
      {hasFiltered && filterValues.employee.value.length > 0 && (
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="flex gap-2 items-center flex-wrap"
          >
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                await handleFilterEvents(
                  filterValues.client.label,
                  "",
                  filterValues.client.value,
                  ""
                );
                setFilterValues((prev) => {
                  return {
                    ...prev,
                    employee: {
                      label: "",
                      value: "",
                    },
                  };
                });
              }}
            >
              <XIcon className="w-3 h-3" />
            </button>
            Staff - {filterValues.employee.label}
          </Button>
        </SheetTrigger>
      )}

      {hasFiltered && filterValues.client.value.length > 0 && (
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="flex gap-2 items-center flex-wrap"
          >
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                await handleFilterEvents(
                  "",
                  filterValues.employee.label,
                  "",
                  filterValues.employee.value
                );

                setFilterValues((prev) => {
                  return {
                    ...prev,
                    client: {
                      label: "",
                      value: "",
                    },
                  };
                });
              }}
            >
              <XIcon className="w-3 h-3" />
            </button>
            Client - {filterValues.client.label}
          </Button>
        </SheetTrigger>
      )}
      {!hasFiltered && (
        <SheetTrigger asChild>
          <button
            type="button"
            className={`flex items-center justify-center gap-3 px-5 py-3 bg-[#2563EB] hover:bg-[#2564ebd9] disabled:bg-[#2564eb69] disabled:hover:bg-[#2564eb69] disabled:text-white disabled:cursor-not-allowed rounded-[6px] h-fit w-fit text-[14px] font-[400] active:bg-[#4274e0f3] text-white`}
          >
            <ListFilter className="w-4 h-4" /> Filter
          </button>
        </SheetTrigger>
      )}

      {hasFiltered && (
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="flex gap-2 items-center flex-wrap"
          >
            <ListFilter className="w-4 h-4" /> More Filters
          </Button>
        </SheetTrigger>
      )}

      <SheetContent className="overflow-auto">
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-[600] text-[#101828]">Filter</h2>
          <p className="text-[14px] font-[400] text-[#475467]">
            Apply filters to calendar.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <h3 className="text-[#344054] text-[14px] font-[500]">Employees</h3>
          <div className="relative flex items-center">
            <div className="absolute left-0 pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-[#94A3B8]" />
            </div>
            <Input
              disabled={filterEventLoading}
              onChange={(e) => handleEmployeeAndClientsSearch(e, "employee")}
              placeholder="Search"
              className="pl-10 pr-5 border-[#E4E4E7] border-[1.5px] placeholder:text-[#c9c9ca] text-black md:w-[336px] outline-none focus:border-none"
            />
          </div>

          <div className="mt-5 flex flex-col gap-5">
            {filteredEmployees.slice(0, noOfEmployeesToDisplay).map((item) => (
              <div key={item.value} className="flex items-center gap-2">
                <Checkbox
                  disabled={filterEventLoading}
                  checked={filterValues.employee.value === item.value}
                  id={item.value}
                  onCheckedChange={(checked) => {
                    setFilterValues((prev) => ({
                      ...prev,
                      employee: {
                        label: checked === true ? item.label : "",
                        value: checked === true ? item.value : "",
                      },
                    }));
                  }}
                />
                <Label
                  htmlFor={item.value}
                  className="text-[#344054] text-[14px] font-[500]"
                >
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-5">
            {filteredEmployees.length > noOfEmployeesToDisplay && (
              <button
                onClick={() =>
                  setNoOfEmployeesToDisplay(noOfEmployeesToDisplay + 10)
                }
                className="mt-3 text-[#1A48AD] text-[14px] font-[600] w-fit"
              >
                Show{" "}
                {Math.min(
                  10,
                  filteredEmployees.length - noOfEmployeesToDisplay
                )}{" "}
                more
              </button>
            )}

            {noOfEmployeesToDisplay > 5 && (
              <button
                onClick={() => setNoOfEmployeesToDisplay(5)}
                className="mt-3 text-[#1A48AD] text-[14px] font-[600] w-fit"
              >
                Show less
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 pb-[12vh]">
          <h3 className="text-[#344054] text-[14px] font-[500]">Clients</h3>
          <div className="relative flex items-center">
            <div className="absolute left-0 pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-[#94A3B8]" />
            </div>
            <Input
              disabled={filterEventLoading}
              onChange={(e) => handleEmployeeAndClientsSearch(e, "clients")}
              placeholder="Search"
              className="pl-10 pr-5 border-[#E4E4E7] border-[1.5px] placeholder:text-[#c9c9ca] text-black md:w-[336px] outline-none focus:border-none"
            />
          </div>

          <div className="mt-5 flex flex-col gap-5">
            {filteredClients.slice(0, noOfClientsToDisplay).map((item) => (
              <div key={item.value} className="flex items-center gap-2">
                <Checkbox
                  disabled={filterEventLoading}
                  checked={filterValues.client.value === item.value}
                  id={item.value}
                  onCheckedChange={(checked) => {
                    setFilterValues((prev) => ({
                      ...prev,
                      client: {
                        label: checked === true ? item.label : "",
                        value: checked === true ? item.value : "",
                      },
                    }));
                  }}
                />
                <Label
                  htmlFor={item.value}
                  className="text-[#344054] text-[14px] font-[500]"
                >
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-5">
            {filteredClients.length > noOfClientsToDisplay && (
              <button
                onClick={() =>
                  setNoOfClientsToDisplay(noOfClientsToDisplay + 10)
                }
                className="mt-3 text-[#1A48AD] text-[14px] font-[600] w-fit"
              >
                Show{" "}
                {Math.min(10, filteredClients.length - noOfClientsToDisplay)}{" "}
                more
              </button>
            )}

            {noOfClientsToDisplay > 5 && (
              <button
                onClick={() => setNoOfClientsToDisplay(5)}
                className="mt-3 text-[#1A48AD] text-[14px] font-[600] w-fit"
              >
                Show less
              </button>
            )}
          </div>
        </div>

        <div className="fixed w-[70%] sm:w-[350px] bottom-0 flex items-center gap-5 justify-end border-t-[0.5px] mt-auto py-5 px-5 bg-white">
          <button
            type="button"
            onClick={() => {}}
            disabled={
              filterEventLoading ||
              (filterValues.client.label.length === 0 &&
                filterValues.employee.label.length === 0)
            }
            className={`flex items-center justify-center gap-3 px-5 py-3 disabled:bg-[#F1F5F9] disabled:hover:bg-[#F1F5F9] disabled:text-[#0f172a4b] disabled:cursor-not-allowed rounded-[6px] h-fit text-[14px] font-[400] bg-[#d9dde1] w-fit hover:bg-[#c7cbce] active:bg-[#a4a7aa] text-[#0F172A]`}
          >
            Save
          </button>

          <button
            type="button"
            onClick={async () => {
              await handleFilterEvents(
                filterValues.client.label,
                filterValues.employee.label,
                filterValues.client.value,
                filterValues.employee.value
              );
              setHasFiltered(true);
              setSheetOpen(false);
            }}
            disabled={
              filterEventLoading ||
              (filterValues.client.label.length === 0 &&
                filterValues.employee.label.length === 0)
            }
            className={`flex items-center justify-center gap-3 px-5 py-3 bg-[#2563EB] hover:bg-[#2564ebd9] disabled:bg-[#2564eb69] disabled:hover:bg-[#2564eb69] disabled:text-white disabled:cursor-not-allowed rounded-[6px] h-fit w-fit text-[14px] font-[400] active:bg-[#4274e0f3] text-white`}
          >
            {filterEventLoading ? <Loader height="h-fit" /> : "Apply"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterSheet;
