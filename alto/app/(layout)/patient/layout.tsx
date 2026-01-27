import { Metadata } from "next";

import { checkPermissions } from "@/lib";

export const metadata: Metadata = {
  title: "Patients",
  description: "Patients page",
};
export default async function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkPermissions();
  return children;
}
