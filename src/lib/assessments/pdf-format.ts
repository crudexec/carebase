type ChoiceOption = {
  value: string | number;
  label?: string;
};

type ListConfig = {
  itemLabel?: string;
};

type RepeaterSubField = {
  id: string;
  label: string;
  type?: string;
  options?: string[];
};

type RepeaterConfig = {
  itemLabel?: string;
  subFields?: RepeaterSubField[];
};

type RawResponseOptions =
  | ChoiceOption[]
  | {
      options?: ChoiceOption[];
      listConfig?: ListConfig;
      repeaterConfig?: RepeaterConfig;
    }
  | null
  | undefined;

export type PdfAssessmentItem = {
  code: string;
  question: string;
  responseType: string;
  responseOptions?: unknown;
  minValue: number | null;
  maxValue: number | null;
};

export type PdfAssessmentResponse = {
  valueNumber: number | null;
  valueText: string | null;
  valueBoolean?: boolean | null;
  valueJson?: unknown;
  notes: string | null;
};

function getChoiceOptions(
  responseOptions: RawResponseOptions
): ChoiceOption[] {
  if (!responseOptions) return [];
  if (Array.isArray(responseOptions)) return responseOptions;
  if (
    typeof responseOptions === "object" &&
    responseOptions !== null &&
    "options" in responseOptions &&
    Array.isArray(responseOptions.options)
  ) {
    return responseOptions.options;
  }

  return [];
}

function getListConfig(responseOptions: RawResponseOptions): ListConfig | null {
  if (
    responseOptions &&
    typeof responseOptions === "object" &&
    !Array.isArray(responseOptions) &&
    "listConfig" in responseOptions
  ) {
    return responseOptions.listConfig ?? null;
  }

  return null;
}

function getRepeaterConfig(
  responseOptions: RawResponseOptions
): RepeaterConfig | null {
  if (
    responseOptions &&
    typeof responseOptions === "object" &&
    !Array.isArray(responseOptions) &&
    "repeaterConfig" in responseOptions
  ) {
    return responseOptions.repeaterConfig ?? null;
  }

  return null;
}

function safeParseJson(value: string | null): unknown {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function formatPrimitive(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function findOptionLabel(
  options: ChoiceOption[],
  rawValue: string | number | boolean
): string | null {
  const normalized = String(rawValue);
  const match = options.find((option) => String(option.value) === normalized);
  return match?.label ?? null;
}

function formatListValue(
  parsedValue: unknown,
  responseOptions: RawResponseOptions
): string[] {
  const listConfig = getListConfig(responseOptions);
  const itemLabel = listConfig?.itemLabel || "Item";

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue
    .map((entry, index) => {
      const formatted = formatPrimitive(entry);
      if (!formatted) return null;
      return `${itemLabel} ${index + 1}: ${formatted}`;
    })
    .filter((line): line is string => Boolean(line));
}

function formatRepeaterValue(
  parsedValue: unknown,
  responseOptions: RawResponseOptions
): string[] {
  const repeaterConfig = getRepeaterConfig(responseOptions);
  const itemLabel = repeaterConfig?.itemLabel || "Entry";
  const subFields = repeaterConfig?.subFields || [];

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue.flatMap((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return [];
    }

    const record = entry as Record<string, unknown>;
    const lines = subFields
      .map((field) => {
        const rawFieldValue = record[field.id];

        if (rawFieldValue === null || rawFieldValue === undefined || rawFieldValue === "") {
          return null;
        }

        let formattedValue = formatPrimitive(rawFieldValue);

        if (field.type === "SINGLE_CHOICE" && field.options?.length) {
          const optionLabel = field.options.find(
            (option) => option === String(rawFieldValue)
          );
          if (optionLabel) {
            formattedValue = optionLabel;
          }
        }

        return `${field.label}: ${formattedValue}`;
      })
      .filter((line): line is string => Boolean(line));

    if (lines.length === 0) {
      return [];
    }

    return [`${itemLabel} ${index + 1}`, ...lines.map((line) => `  ${line}`)];
  });
}

export function getAssessmentFieldLabel(item: PdfAssessmentItem): string {
  return item.question?.trim() || item.code;
}

export function formatAssessmentResponseForPdf(
  item: PdfAssessmentItem,
  response?: PdfAssessmentResponse
): string[] {
  if (!response) {
    return ["Not answered"];
  }

  const responseOptions = item.responseOptions as RawResponseOptions;
  const choiceOptions = getChoiceOptions(responseOptions);
  const valueJson = response.valueJson ?? safeParseJson(response.valueText);

  switch (item.responseType) {
    case "YES_NO": {
      if (response.valueBoolean !== null && response.valueBoolean !== undefined) {
        return [response.valueBoolean ? "Yes" : "No"];
      }

      if (response.valueNumber !== null) {
        return [response.valueNumber === 1 ? "Yes" : "No"];
      }

      if (response.valueText) {
        const normalized = response.valueText.trim().toLowerCase();
        return [normalized === "true" || normalized === "yes" || normalized === "1" ? "Yes" : "No"];
      }

      return ["Not answered"];
    }

    case "SINGLE_SELECT":
    case "SINGLE_CHOICE": {
      const rawValue = response.valueText ?? response.valueNumber;
      if (rawValue === null || rawValue === undefined || rawValue === "") {
        return ["Not answered"];
      }

      const optionLabel = findOptionLabel(choiceOptions, rawValue);
      return [optionLabel ?? String(rawValue)];
    }

    case "MULTI_SELECT":
    case "MULTIPLE_CHOICE": {
      const parsed = Array.isArray(valueJson)
        ? valueJson
        : typeof response.valueText === "string"
          ? response.valueText.split(",").map((value) => value.trim()).filter(Boolean)
          : [];

      if (!Array.isArray(parsed) || parsed.length === 0) {
        return ["Not answered"];
      }

      return parsed.map((value) => {
        const optionLabel = findOptionLabel(choiceOptions, String(value));
        return optionLabel ?? String(value);
      });
    }

    case "LIST": {
      const lines = formatListValue(valueJson, responseOptions);
      return lines.length > 0 ? lines : ["Not answered"];
    }

    case "REPEATER": {
      const lines = formatRepeaterValue(valueJson, responseOptions);
      return lines.length > 0 ? lines : ["Not answered"];
    }

    case "SIGNATURE":
      return [response.valueText ? "Signature captured" : "Not answered"];

    case "PHOTO":
      return [response.valueText ? "Photo attached" : "Not answered"];

    case "BODY_MAP":
      return [response.valueText ? "Body map completed" : "Not answered"];

    case "RATING_SCALE":
    case "SCALE":
    case "NUMBER": {
      if (response.valueNumber === null || response.valueNumber === undefined) {
        return ["Not answered"];
      }

      const optionLabel = findOptionLabel(choiceOptions, response.valueNumber);
      const valueLabel = optionLabel
        ? `${optionLabel} (${response.valueNumber})`
        : String(response.valueNumber);

      if (item.minValue !== null && item.maxValue !== null) {
        return [`${valueLabel} (range ${item.minValue}-${item.maxValue})`];
      }

      return [valueLabel];
    }

    default: {
      const rawValue =
        response.valueText ??
        formatPrimitive(response.valueJson) ??
        (response.valueNumber !== null ? String(response.valueNumber) : "");

      if (!rawValue) {
        return ["Not answered"];
      }

      return String(rawValue)
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    }
  }
}
