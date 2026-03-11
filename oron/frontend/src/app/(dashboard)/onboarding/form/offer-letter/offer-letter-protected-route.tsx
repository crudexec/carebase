"use client";

import { ReactNode, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { retrieveOfferLetterForm } from "@/use-cases/forms";

const OfferLetterProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [userHasOfferLetter, setUserHasOfferLetter] = useState<boolean>(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleOfferLetterValidity = useCallback(async () => {
    try {
      const token = localStorage.getItem("token") as string;

      const response = await retrieveOfferLetterForm(token);

      if (typeof response === "boolean" || !response) {
        router.push("/onboarding/form");
      }
      setIsLoading(false);
      setUserHasOfferLetter(true);
    } catch (error) {
      router.push("/onboarding/form");
    }
  }, [router]);

  useEffect(() => {
    handleOfferLetterValidity();
  }, [handleOfferLetterValidity]);

  if (isLoading) return <Loader />;

  return userHasOfferLetter ? <>{children}</> : <Loader />;
};

export default OfferLetterProtectedRoute;
