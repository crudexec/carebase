import { Metadata } from "next";

import { checkPermissions } from "@/lib";

export const metadata: Metadata = {
  title: "Assessment",
  description: "Assessment page",
};

export default async function SchedulingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkPermissions();
  return children;
}
