export * from "./populate";
import { Dispatch, SetStateAction } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { z, type ZodIssue } from "zod";

import { SearchParamsType } from "@/schema/query";

export type ISetState<T> = Dispatch<SetStateAction<T>>;
export type InferSchema<T> = T extends z.ZodType<infer U> ? U : never;
export type FormReturn<T extends FieldValues> = UseFormReturn<
  InferSchema<T> extends FieldValues ? InferSchema<T> : FieldValues
>;

export type ObjectData = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export type ColType = {
  key: string;
  label: string;
  sortable?: "enabled" | "disabled";
  hideable?: "enabled" | "disabled";
  visible?: boolean;
};

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: string;
}

export type ActionType = "create" | "edit" | "delete" | "view" | "assign";

export type TableColumn = {
  key: string;
  label?: string;
  visible?: boolean;
};

export type UserGroupType =
  | "nurse"
  | "therapist"
  | "caregiver"
  | "all"
  | "archived";

export type PaginateSortFilterType = {
  search: SearchParamsType;
  pageIndex: number;
  pageSize: number;
  filteredKeys: string[];
};

export type SortConfig = {
  key: string;
  direction: string;
};

export type ValidateParseResponse = {
  success: boolean;
  error: { errors: ZodIssue[] };
};

export interface SearchParamProps {
  searchParams: SearchParams;
}

export type FileDetails = {
  filename: string;
  path: string;
  contentType: string;
};

export type DeletePayload = {
  ids: string[];
  status: string;
};

export interface PageProps {
  params: { slug: string; id: string; patientId?: string };
  searchParams: SearchParamsType;
}
export type FetcherError = Error & { info: Error; status: number };

export type QueryType = {
  pageIndex: number;
  pageSize: number;
  search?: string;
};

export type UJsonObject = { [Key in string]?: UJsonValue };
export type UJsonArray = Array<UJsonValue>;
export type UJsonValue =
  | undefined
  | string
  | number
  | boolean
  | null
  | UJsonObject
  | UJsonArray;
