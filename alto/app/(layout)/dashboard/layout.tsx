import { Metadata } from "next";

import { getServerSession } from "@/lib";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard page",
};
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simple auth check without role-based permissions for now
  const user = await getServerSession();

  if (!user) {
    redirect("/login");
  }

  return children;
}
