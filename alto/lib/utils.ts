import axios, { AxiosError } from "axios";
import { type ClassValue, clsx } from "clsx";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import _, { isEmpty } from "lodash";
import { ReadonlyURLSearchParams } from "next/navigation";
import { RRule, Weekday, WeekdayStr } from "rrule";
import { Fetcher } from "swr";
import { twMerge } from "tailwind-merge";

import { FetcherError, ObjectData, type TableColumn } from "@/types";

dayjs.extend(utc);

import toast from "react-hot-toast";
import { v4 } from "uuid";

import { getObjectURL } from "../app/api/lib/aws";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const capitalize = (text = "") =>
  text.trim().charAt(0).toUpperCase() + text.trim().slice(1).toLowerCase();

export function generateImageUrl(providerId: string, image: string) {
  return `${providerId}/${image}`;
}

export const getImageUrl = (providerId?: string, image?: string | null) => {
  if (!image || image.includes("http")) {
    return image;
  } else {
    const finalUrl = generateImageUrl(providerId as string, image);
    const url = getObjectURL(finalUrl);
    return url;
  }
};

export const pickValues = <T extends Record<string, unknown>>(
  obj: T,
): Partial<T> => {
  const pickedObj: Partial<T> = {};
  Object.keys(obj).forEach((key: keyof T) => {
    if (
      !_.isUndefined(obj[key]) &&
      !_.isNull(obj[key]) &&
      !_.isEqual(obj[key], "")
    ) {
      pickedObj[key] = obj[key];
    }
  });
  return pickedObj;
};

export type FetcherType<T> = Fetcher<T, string>;

export const handleErrorOnRequest = (errorInfo: Error, status: number) => {
  let error: FetcherError;
  try {
    error = new Error(errorInfo.message) as FetcherError;
    error.message = errorInfo.message;
  } catch (e) {
    error = new Error("An error occured!") as FetcherError;
    error.message = "An error error occured!";
  }
  error.status = status;
  throw error;
};

// Create query string
export const createQueryString = (
  params: Record<string, string | number | null>,
  searchParams: ReadonlyURLSearchParams,
) => {
  const newSearchParams = new URLSearchParams(searchParams?.toString());

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === "") {
      newSearchParams.delete(key);
    } else {
      newSearchParams.set(key, String(value));
    }
  }

  return newSearchParams.toString();
};

export const createReqQuery = (data: ObjectData) => {
  const newValues = pickValues(data);
  return Object.keys(newValues)
    .map((key) => `${key}=${data[key]}`)
    .join("&");
};

export const getOrStoreColumns = (
  columns: TableColumn[],
  tableKey: string,
): TableColumn[] => {
  const localColumns = localStorage.getItem("columns") || "";
  const tableName = tableKey.toLowerCase().replace(/\s/g, "_");
  if (isEmpty(localColumns)) {
    localStorage.setItem("columns", JSON.stringify({ [tableName]: columns }));
    return columns;
  } else {
    const parsedColumns = JSON.parse(localColumns);
    if (
      !parsedColumns[tableName] ||
      parsedColumns[tableName].length !== columns.length
    ) {
      localStorage.setItem(
        "columns",
        JSON.stringify({ ...parsedColumns, [tableName]: columns }),
      );
      return columns;
    }
    return parsedColumns[tableName];
  }
};

export const toggleColumn = (tableKey: string, column: TableColumn) => {
  const tableName = tableKey.toLowerCase().replace(/\s/g, "_");
  const localColumns = localStorage.getItem("columns") || "";
  if (!isEmpty(localColumns)) {
    const parsedColumns = JSON.parse(localColumns);
    if (parsedColumns[tableName]) {
      const selectedColumns = parsedColumns[tableName].map(
        (col: TableColumn) => {
          if (col.key === column.key) {
            return { ...col, visible: !col.visible };
          }
          return col;
        },
      );
      localStorage.setItem(
        "columns",
        JSON.stringify({ ...parsedColumns, [tableName]: selectedColumns }),
      );
      return selectedColumns;
    }
    return parsedColumns[tableName];
  }
};

export const toggleAllColumns = (tableKey: string, hide = false) => {
  const name = tableKey.toLowerCase().replace(/\s/g, "_");
  const localColumns = localStorage.getItem("columns") || "";
  if (!isEmpty(localColumns)) {
    const parsedColumns = JSON.parse(localColumns);
    if (parsedColumns[name]) {
      let selectedColumns: TableColumn[];
      if (hide) {
        selectedColumns = parsedColumns[name].map((col: TableColumn) => {
          return { ...col, visible: false };
        });
        localStorage.setItem(
          "columns",
          JSON.stringify({
            ...parsedColumns,
            [name]: selectedColumns,
          }),
        );
      } else {
        selectedColumns = parsedColumns[name].map((col: TableColumn) => {
          return { ...col, visible: true };
        });

        localStorage.setItem(
          "columns",
          JSON.stringify({ ...parsedColumns, [name]: selectedColumns }),
        );
      }
      return selectedColumns;
    }
    return parsedColumns[name];
  }
};
export const filterArray = <
  T extends Record<
    string,
    Date | string | null | undefined | string[] | boolean
  >,
>(
  data: T[],
) =>
  _.filter(data, (obj) => {
    return _.some(obj, (value) => {
      return (
        !_.isNull(value) &&
        !_.isUndefined(value) &&
        !_.isEmpty(value.toString())
      );
    });
  });

export const parseDateString = (date?: Date | null) => {
  return date ? new Date(date) : undefined;
};

export const isValidDate = (value: string | boolean | Date) =>
  value?.toString()?.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);

export const modifyDateFields = <T extends ObjectData>(data: T): T => {
  for (const key in data) {
    if (typeof data[key] === "string" && isValidDate(data[key] as string)) {
      data[key as keyof T] = parseDateString(data[key] as Date) as T[keyof T];
    }
  }
  return data;
};

export const formatDate = (date?: Date | string | null) => {
  return date ? dayjs(date).format("MMM D, YYYY") : "-";
};
export const formatDateTime = (date?: Date | string | null) => {
  return date ? dayjs(date).format("MMM D, YYYY hh:mmA") : "-";
};

export const getTime = (date?: Date | string | null) => {
  return date ? dayjs(date).format("hh:mmA") : "-";
};

export const addTimeToDate = (time: string, date = new Date()) => {
  return new Date(`${dayjs(date).format("YYYY-MM-DD")}T${time}`);
};

export const downloadFile = async (query: string) => {
  const res = await axios.get(query, {
    responseType: "blob",
  });
  const filename = (res.headers["content-disposition"] || "").split(
    "filename=",
  )[1];
  const url = URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const convertToDate = (dateString: string) => {
  const d = dateString.split("/");
  const dat = dayjs(d[2] + "/" + d[1] + "/" + d[0]);
  return dat;
};

export function getAllDays(year: number, month: number, dayOfWeek: number) {
  const result = [];
  const date = new Date(year, month, 1);
  const firstDayOfWeek = date.getDay();
  const diff = (firstDayOfWeek - dayOfWeek + 7) % 7;

  date.setDate(date.getDate() - diff);

  while (date.getMonth() === month) {
    result.push(new Date(date));
    date.setDate(date.getDate() + 7);
  }
  return result;
}

export enum Pattern {
  ONCE = "ONCE",
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export const getDailyAndWeeklyDates = ({
  pattern,
  start,
  end,
  frequency,
  days,
  occurrence,
}: {
  pattern: Pattern;
  start: Date;
  frequency?: number;
  days?: WeekdayStr[];
  occurrence?: number;
  end?: Date;
}): Date[] => {
  if (pattern === "ONCE") {
    return [start];
  }
  const startDate = dayjs.utc(start).toDate();
  const endDate = dayjs.utc(end).toDate();
  const periods = { dtstart: startDate, ...(end && { until: endDate }) };

  if (pattern === "DAILY") {
    let rule;
    if (!frequency) {
      // everyweekday
      rule = new RRule({
        freq: RRule.WEEKLY,
        byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
        ...periods,
        ...(occurrence && { count: occurrence }),
      });
    } else {
      // every x days
      rule = new RRule({
        freq: RRule.DAILY,
        interval: frequency,
        ...periods,
        ...(occurrence && { count: occurrence }),
      });
    }
    const recurringDates = rule.all();
    return recurringDates;
  } else if (pattern === "WEEKLY") {
    const rule = new RRule({
      freq: RRule.WEEKLY,
      ...periods,
      ...(frequency && { interval: frequency }),
      ...(days?.length && { byweekday: days }),
      ...(occurrence && { count: occurrence }),
    });
    const recurringDates = rule.all();
    return recurringDates;
  } else {
    const rule = new RRule({
      freq: RRule[pattern],
      ...periods,
      ...(occurrence && { count: occurrence }),
      ...(frequency && { interval: frequency }),
      ...(days?.length && { byweekday: days }),
      ...(occurrence && { count: occurrence }),
    });
    const recurringDates = rule.all();
    return recurringDates;
  }
};

export const getMonthlyDates = ({
  frequency,
  nth,
  days,
  monthdays,
  occurrence,
  pattern,
  start,
  end,
  bysetpos,
}: {
  pattern: Pattern;
  start: Date;
  end?: Date;
  frequency?: number;
  days?: WeekdayStr[];
  nth?: number;
  monthdays?: number[];
  occurrence?: number;
  bysetpos?: number;
}): Date[] => {
  if (pattern === "ONCE") {
    return [start];
  }
  const startDate = dayjs.utc(start).toDate();
  const endDate = dayjs.utc(end).toDate();
  const periods = { dtstart: startDate, ...(end && { until: endDate }) };
  // nth day of x month
  const rule = new RRule({
    ...(nth &&
      days?.length && { byweekday: days.map((day) => RRule[day]["nth"](nth)) }),
    ...(frequency && { interval: frequency }),
    ...(monthdays?.length && { bymonthday: monthdays }),
    freq: RRule.MONTHLY,
    ...periods,
    ...(occurrence && { count: occurrence }),
    ...(bysetpos && { bysetpos }),
  });

  const recurringDates = rule.all();
  return recurringDates;
};

export const getYearlyDates = ({
  pattern,
  start,
  end,
  days,
  months,
  monthdays,
  occurrence,
  frequency,
  bysetpos,
}: {
  pattern: Pattern;
  start: Date;
  end?: Date;
  days?: WeekdayStr[] | Weekday[];
  months?: number[];
  monthdays?: number[];
  occurrence: number;
  bysetpos?: number | number[];
  frequency?: number;
}): Date[] => {
  if (pattern === "ONCE") {
    return [start];
  }
  const startDate = dayjs.utc(start).toDate();
  const endDate = dayjs.utc(end).toDate();
  const periods = { dtstart: startDate, ...(end && { until: endDate }) };

  const rule = new RRule({
    ...(months?.length && { bymonth: months }),
    freq: RRule.YEARLY,
    ...(monthdays?.length && { bymonthday: monthdays }),
    ...periods,
    ...(occurrence && { count: occurrence }),
    ...(bysetpos && { bysetpos }),
    ...(days?.length && { byweekday: days }),
    ...(frequency && { interval: frequency }),
  });

  const recurringDates = rule.all();
  return recurringDates;
};

export const resetTime = (date: Date, time = "00:00") => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}T${time}:00.000Z`;
};

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const getFullName = (
  firstName: string | null = "",
  lastName: string | null = "",
  emptyState?: string,
) => {
  if (!firstName && !lastName) {
    return emptyState ?? "-";
  }
  return `${firstName} ${lastName}`;
};

export function addThousandSeparator(
  value: number | string,
  fractionalDigits = 2,
) {
  return Number(Number(value).toFixed(fractionalDigits)).toLocaleString("en", {
    minimumFractionDigits: fractionalDigits,
    maximumFractionDigits: fractionalDigits,
  });
}

export const generateUUID = () => {
  const myUUID = v4();
  return myUUID;
};

export function isTrue(value?: string | boolean | number) {
  if (typeof value === "string") {
    value = value.trim().toLowerCase();
  }
  switch (value) {
    case true:
    case "true":
    case 1:
    case "1":
    case "on":
    case "yes":
      return true;
    default:
      return false;
  }
}

export const parseData = <T>(data: T) => {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    return data;
  }
};

export const getAssessment = (type: string) => {
  switch (type) {
    case "OASIS":
      return "Oasis";
    case "NON_OASIS":
      return "Non-Oasis";
    case "PEDIATRIC":
      return "Pediatric Assessment";
    case "NON_SKILLED":
      return "Pediatric Assessment";
    default:
      return "";
  }
};

type ValidateType = {
  visitDate: Date;
  timeIn: string;
  timeOut: string;
};

export const validateVisitDate = (data: ValidateType) => {
  if (!data?.visitDate || !data?.timeIn || !data?.timeOut) {
    toast.error("Ensure visit date, arrival and departure time are provided");
    return false;
  }
  return true;
};

export const fetcher = async <T>(
  ...args: [RequestInfo, RequestInit]
): Promise<T> => {
  const res = await fetch(...args);
  const data: T = await res.json();

  if (!res.ok) {
    handleErrorOnRequest(data as AxiosError<{ message: string }>, res.status);
  }

  return data;
};
