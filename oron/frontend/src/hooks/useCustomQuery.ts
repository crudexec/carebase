"use client";

import { useQuery } from "@tanstack/react-query";

// Defining a generic type for asynchronous functions that take a token and return a promise
type FuncType<T> = (token: string) => Promise<T>;

// Defining a type to extract the return type of a function
type ReturnTypeOfFunc<T> = T extends (...args: any[]) => infer R ? R : any;

// Extracting the final return type of the asynchronous function
type T = ReturnTypeOfFunc<ReturnTypeOfFunc<FuncType<any>>>;

// Custom hook to execute a custom query using the provided function and key
const useCustomQuery = <T>(
  key: string, // Key for the query
  func: FuncType<T>, // Function that performs the query
  enabled?: boolean, // Optional flag to enable or disable the query
  staleTime?: number
) => {
  // Retrieving the token from local storage
  const token = localStorage.getItem("token") as string;

  // Executing the query using useQuery hook with the provided function
  // and passing the token as an argument
  const { ...props } = useQuery<T>({
    queryKey: [key], // Setting the query key
    queryFn: async () => await func(token), // Executing the function with the token
    enabled: enabled ?? true, // Setting the query enabled flag (defaults to true if not provided)
    staleTime: staleTime ?? 0,
  });

  // Returning the query result props
  return { ...props };
};

export default useCustomQuery;
