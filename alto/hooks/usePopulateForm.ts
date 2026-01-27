"use client";
import { isEmpty } from "lodash";
import { useEffect } from "react";

import { pickValues } from "@/lib";

type Nullable<T> = T | null;
type FormDataType = string | Date | boolean | string[];

const usePopulateForm = <
  T,
  A extends Record<string, Nullable<FormDataType>> | T,
>(
  reset: (value: Partial<T>) => void,
  data?: A,
) => {
  useEffect(() => {
    if (data && !isEmpty(data)) {
      reset(pickValues(data) as Partial<T>);
    }
  }, [data, reset]);
};

export default usePopulateForm;
