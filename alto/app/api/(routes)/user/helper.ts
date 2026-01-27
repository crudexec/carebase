import { ServiceType, User } from "@prisma/client";

import prisma from "@/prisma";
import enforcer from "@/prisma/adapter";
import { UserHistoryResponse, UserResponse } from "@/types";

import { asyncForEach, enumFilter, getImageUrl, isActive } from "../../lib";

type UserWithImage = User & {
  image: string;
  role: string;
  userHistory?: UserHistoryResponse;
};

export async function getUsers({
  status,
  authUser,
  role,
}: {
  status?: string;
  authUser?: UserResponse;
  role: string;
}) {
  let users: UserWithImage[] = [];
  const e = await enforcer();

  if (role === "all") {
    const result = await prisma.$transaction([
      prisma.user.count({
        where: {
          active: isActive(status),
          UserProvider: {
            some: { providerId: authUser?.providerId as string },
          },
        },
      }),
      prisma.user.findMany({
        where: {
          active: isActive(status),
          UserProvider: {
            some: { providerId: authUser?.providerId as string },
          },
        },
        include: {
          image: true,
          userHistory: {
            include: {
              media: true,
              caregiverCertifications: true,
              professionalLicense: true,
              driversLicense: true,
            },
          },
        },
      }),
    ]);
    users = await Promise.all(
      result[1].map(async (user) => {
        if (user.userHistory?.media) {
          user.userHistory.media = await Promise.all(
            user.userHistory.media.map(async (med) => ({
              ...med,
              mediaId:
                (await getImageUrl(
                  authUser?.providerId as string,
                  med.mediaId,
                )) || "",
            })),
          );
        }
        const role = await e.getFilteredNamedPolicy(
          "p",
          0,
          user?.id,
          "",
          authUser?.providerId as string,
        );
        return {
          ...user,
          image: (await getImageUrl(
            authUser?.providerId as string,
            user.image?.src ?? user.image?.mediaId,
          )) as string,
          userHistory: user?.userHistory as UserHistoryResponse,
          role: role?.[0]?.[1],
        };
      }),
    );
    return { users, totalCount: result[0] };
  } else {
    const policies = await e.getFilteredNamedPolicy(
      "p",
      0,
      "",
      role,
      authUser?.providerId as string,
    );
    if (policies?.length === 0) {
      return { users: [], totalCount: 0 };
    } else {
      await asyncForEach(
        policies.map((policy) => ({ user: policy[0], role: policy[1] })),
        async (policy) => {
          const user = await prisma.user.findFirst({
            where: {
              id: policy?.user,
              active: isActive(status),
              UserProvider: {
                some: { providerId: authUser?.providerId as string },
              },
            },
            include: {
              image: true,
              userHistory: {
                include: {
                  media: true,
                  caregiverCertifications: true,
                  professionalLicense: true,
                  driversLicense: true,
                },
              },
            },
          });
          if (user) {
            if (user?.userHistory?.media) {
              user.userHistory.media = await Promise.all(
                user.userHistory.media.map(async (med) => ({
                  ...med,
                  mediaId:
                    (await getImageUrl(
                      authUser?.providerId as string,
                      med.mediaId,
                    )) || "",
                })),
              );
            }
            users.push({
              ...user,
              image: (await getImageUrl(
                authUser?.providerId as string,
                user.image?.src ?? user.image?.mediaId,
              )) as string,
              userHistory: user?.userHistory as UserHistoryResponse,
              role: policy?.role,
            });
          }
        },
      );
      return { users, totalCount: users.length };
    }
  }
}

const getSplitQuery = (search: string, field1: string, field2: string) => {
  const [firstName, lastName] = search?.split(" ") || [];
  return {
    [field1]: { contains: firstName, mode: "insensitive" },
    [field2]: { contains: lastName, mode: "insensitive" },
  };
};

export const searchFilter = (
  columns: Partial<keyof User>[],
  search: string,
) => {
  return /\s/g.test(search)
    ? {
        OR: [
          getSplitQuery(search, "firstName", "lastName"),
          getSplitQuery(search, "lastName", "firstName"),
        ],
      }
    : search
      ? {
          OR: [...columns].map((field) => {
            const enumFields = ["service"];
            if (enumFields.includes(field as string)) {
              return enumFilter(field, search, { service: ServiceType });
            }
            return { [field]: { contains: search, mode: "insensitive" } };
          }),
        }
      : {};
};

export const assignRoleToUser = async (
  user: string,
  role: string,
  providerId: string,
) => {
  const e = await enforcer();
  const res = await e.enforce(user, role, providerId as string);
  if (!res) {
    await e.addNamedPolicy("p", user, role, providerId as string);
  }
};
