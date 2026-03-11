"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Custom hook to manage authentication state
const useAuth = () => {
  const router = useRouter(); // Accessing the Next.js router
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // State variable to track authentication status

  useEffect(() => {
    // Checking if a token exists in local storage
    const token = localStorage.getItem("token");
    if (!token) {
      // If no token exists, user is not logged in
      setIsLoggedIn(false);
      // Redirecting to the login page
      router.push("/login");
    } else {
      // If token exists, user is considered logged in
      setIsLoggedIn(true);
    }
  }, [router]); // Dependency array to re-run the effect when the router changes

  // Returning the authentication status
  return isLoggedIn;
};

export default useAuth;
