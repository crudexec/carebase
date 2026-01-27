"use server";
import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { UserResponse } from "@/types";

const APP_URL = process.env.APP_URL;
export async function getCookies() {
  const auth = cookies().get("auth")?.value;
  const refresh = cookies().get("refresh")?.value;
  return { auth, refresh };
}

function hasPermissions(permissions: string[], userRole: string): boolean {
  return permissions.includes(userRole);
}

export const getServerSession =
  async (): Promise<UserResponse | void | null> => {
    try {
      const response = await axios.get(`${APP_URL}/api/user/me`, {
        headers: {
          Cookie: `auth=${cookies().get("auth")?.value}; refresh=${cookies().get("refresh")?.value}`,
        },
      });
      const user = await response?.data;
      return user?.data;
    } catch (err) {
      if (err?.response?.status === 403) {
        return null;
      }
    }
  };

export const checkPermissions = async (
  permissions: string[] = ["administrator"],
) => {
  const user = await getServerSession();
  if (user) {
    const hasPermission = hasPermissions(permissions, user?.role ?? "");
    if (hasPermission) {
      return true;
    } else {
      redirect("/404");
    }
  } else {
    redirect("/login");
  }
};
