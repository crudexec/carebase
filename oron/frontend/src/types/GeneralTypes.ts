export type FormMutationResponse<T = unknown> = {
  errorMessage: string;
  status: boolean;
  data?: T;
};

export type ErrorState = {
  field: string[];
  message: string[];
};

export type RequestMethod = "POST" | "PATCH";
