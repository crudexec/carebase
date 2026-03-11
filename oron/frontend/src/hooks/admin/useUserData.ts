"use client";

import { useState, useEffect, useCallback } from "react";
import { UserTableContainer } from "@/components/admin/UsersColumns";
import { format, parseISO } from "date-fns";
import { capitalizeFirstLetter } from "@/utils";
import {
  AllUsersResponse,
  SingleUser,
  TransformUserResponse,
} from "@/types/AdminTypes";
import { NUMBER_OF_FORMS } from "@/constants";

const useUserData = (allUsersData: AllUsersResponse | boolean) => {
  const [userData, setUserData] = useState<UserTableContainer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const transformUser = (user: SingleUser) => {
    const completedPercentage = user?.approved
      ? Math.floor((user?.approved / NUMBER_OF_FORMS) * 100)
      : 0;

    return {
      id: user?.id,
      employeeName: capitalizeFirstLetter(
        `${user?.last_name.toLowerCase()} ${user?.first_name.toLowerCase()}`
      ),
      email: user?.email,
      awaitingApproval: user?.awaiting_approval?.toString() || "0",
      notFilled: user?.not_started?.toString() || "0",
      completed: user?.approved?.toString() || "0",
      dateJoined: user?.created_at,
      onboardingProgress: `${completedPercentage}`,
      role: user?.role || "STANDARD",
      status: user?.status || "ACTIVE",
    };
  };

  const fetchUserData = useCallback(async () => {
    if (!allUsersData || typeof allUsersData === "boolean") {
      return;
    }

    try {
      setIsLoading(true);
      const transformedData = await Promise.all(
        allUsersData.data.usersData.map(transformUser)
      );

      // Sort and format data
      const formattedData = transformedData
        .sort(
          (a, b) =>
            new Date(b.dateJoined).getTime() - new Date(a.dateJoined).getTime()
        )
        .map((user) => ({
          ...user,
          dateJoined: format(parseISO(user.dateJoined), "PPP"),
        }));

      setUserData(formattedData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [allUsersData]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const transformUserData = useCallback(
    async (data: TransformUserResponse): Promise<UserTableContainer[]> => {
      const transformedData: UserTableContainer[] = await Promise.all(
        data?.data?.usersData?.map(transformUser) || []
      );

      // Sort and format data
      return transformedData
        .sort(
          (a, b) =>
            new Date(b.dateJoined).getTime() - new Date(a.dateJoined).getTime()
        )
        .map((user) => ({
          ...user,
          dateJoined: format(parseISO(user.dateJoined), "PPP"),
        }));
    },
    []
  );

  return { userData, isLoading, transformUserData };
};

export default useUserData;
