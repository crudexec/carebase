"use client";

import { ReactNode, useEffect, useState, useCallback, useRef } from "react";
import useAuth from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { validateUserProfile } from "@/use-cases/user";
import Loader from "@/components/Loader";
import useLocalStorage from "@/hooks/useLocalStorage";

const ProtectedRoute = ({
  children,
  admin,
  clientManager,
  employeeManager,
}: {
  children: ReactNode;
  admin?: boolean;
  clientManager?: boolean;
  employeeManager?: boolean;
}) => {
  const pathname = usePathname();
  const isLoggedIn = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const hasValidated = useRef(false);

  const { storedValue } = useLocalStorage<string>("token");

  const fetchData = useCallback(async () => {
    const token = storedValue as string;

    if (isLoggedIn === null) return;

    if (!isLoggedIn) {
      localStorage.setItem("protected_redirect_path", pathname);
      router.push("/login");
      return;
    }

    // Skip re-validation if we've already successfully validated in this session
    if (hasValidated.current && !isLoading) {
      return;
    }

    try {
      const response = await validateUserProfile(token);
      if (typeof response === "boolean" || !response) {
        router.push("/login");
        return;
      }

      const userRole = response.data.role;

      if (userRole === "CLIENT_MANAGER") {
        if (clientManager) {
          hasValidated.current = true;
          setIsLoading(false);
        } else {
          router.push("/client-manager/clients");
        }
      } else if (userRole === "EMPLOYEE_MANAGER") {
        if (employeeManager) {
          hasValidated.current = true;
          setIsLoading(false);
        } else {
          router.push("/employee-manager");
        }
      } else if (
        (admin && !response) ||
        (admin && userRole === "STANDARD")
      ) {
        router.push("/admin-login");
      } else if (!admin && !clientManager && !employeeManager && userRole === "ADMINISTRATOR") {
        router.push("/admin");
      } else {
        hasValidated.current = true;
        setIsLoading(false);
      }
    } catch (error) {
      router.push("/login");
    }
  }, [isLoggedIn, router, admin, clientManager, employeeManager, storedValue, isLoading, pathname]);

  useEffect(() => {
    fetchData();
    // Only re-run when login state or token changes, not on every pathname change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, storedValue, admin, clientManager, employeeManager]);

  if (isLoading) return <Loader />;

  return isLoggedIn ? <>{children}</> : <Loader />;
};

export default ProtectedRoute;
