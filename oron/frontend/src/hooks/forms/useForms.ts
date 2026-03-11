"use client";

import { useQuery } from "@tanstack/react-query";
import { generateFormData } from "@/lib/forms/forms-processor";
import { GeneratedFormType } from "@/types/form-types/FormTypes";

const useForms = () => {
  // Retrieve token from local storage
  const token = localStorage.getItem("token") as string;

  // Destructure props from the result of the useQuery hook
  const { ...props } = useQuery<GeneratedFormType>({
    // Define query key for caching purposes
    queryKey: ["formData", "offerLetter"],
    // Define query function to fetch form data using the token
    queryFn: async () => await generateFormData(token),
  });

  // Return props obtained from the useQuery hook
  return { ...props };
};

export default useForms;
