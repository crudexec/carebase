"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { generateUserFormData } from "@/use-cases/admin";
import { useSearchParams } from "next/navigation";
import { UserFormInfo } from "@/types/AdminTypes";

const useUserForms = (id?: string) => {
  // Retrieve search parameters from the URL
  const searchParams = useSearchParams();
  // Get the "id" parameter from the search parameters
  const paramsId = searchParams.get("id") as string;

  // State to store the user ID
  const [userId, setUserId] = useState<string>(paramsId ?? "");

  // Retrieve token from local storage
  const token = localStorage.getItem("token") as string;

  // Effect to update the user ID when the "id" prop or search parameters change
  useEffect(() => {
    // Update user ID if the "id" prop is provided
    if (id) {
      setUserId(id);
    }
    // Update user ID if the "id" parameter is present in the search parameters
    if (paramsId) {
      setUserId(paramsId);
    }
  }, [id, searchParams, paramsId]);

  // Fetch user form data using the user ID
  const { ...props } = useQuery<UserFormInfo>({
    queryKey: ["userFormData", userId],
    // Define query function to fetch user form data using the token and user ID
    queryFn: async () => await generateUserFormData(token, userId),
    // Enable the query when the user ID is longer than 10 characters
    enabled: userId?.length > 10,
  });

  // Return the result obtained from the useQuery hook
  return { ...props };
};

export default useUserForms;
