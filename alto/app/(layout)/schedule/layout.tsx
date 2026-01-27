import { Metadata } from "next";

import { checkPermissions } from "@/lib";

export const metadata: Metadata = {
  title: "Scheduling",
  description: "Scheduling page",
};

export default async function SchedulingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkPermissions();
  return children;
}
