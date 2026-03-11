"use client";

import { User } from "@/types/UserTypes";
import { fetchUserProfile } from "@/use-cases/user";
import { useQuery } from "@tanstack/react-query";

// Custom hook to fetch user data
const useUser = () => {
  // Retrieve token from local storage
  const token = localStorage.getItem("token") as string;

  // Use the useQuery hook to fetch user profile data
  const { ...props } = useQuery<User>({
    // Specify the query key as "user-profile"
    queryKey: ["user-profile"],
    // Define the query function to fetch user profile using the token
    queryFn: async () => await fetchUserProfile(token),
  });

  // Return the props obtained from useQuery hook
  return { ...props };
};

export default useUser;
