"use client";

import { ReactNode, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import Loader from "@/components/Loader";
import { retrieveClientById } from "@/use-cases/clients";

const excludeUrl = ["new-intake"];

const ClientDetailsProtectedRoute = ({
  children,
  admin,
}: {
  children: ReactNode;
  admin?: boolean;
}) => {
  const { clientId } = useParams<{ clientId: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [clientExists, setClientExists] = useState(false);

  const isClientDetailsPage =
    pathname.startsWith("/clients/") &&
    pathname.length > 8 &&
    clientId &&
    !excludeUrl.includes(clientId);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token") as string;
      const response = await retrieveClientById(token, clientId);

      if (response) {
        setClientExists(true);
        setIsLoading(false);
      } else {
        setClientExists(false);
        router.push(`${admin ? "/admin/clients" : "/clients"}`);
      }
    } catch (error) {
      setIsLoading(false);
      router.push(`${admin ? "/admin/clients" : "/clients"}`);
    }
  }, [router, clientId, admin]);

  useEffect(() => {
    if (isClientDetailsPage) {
      fetchData();
    }
  }, [fetchData, clientId, isClientDetailsPage]);

  if (!isClientDetailsPage) {
    return children;
  }

  if (isLoading) return <Loader />;

  return <>{isClientDetailsPage && clientExists && children}</>;
};

export default ClientDetailsProtectedRoute;
