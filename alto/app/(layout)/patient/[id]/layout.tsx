import { Metadata } from "next";

import { checkPermissions } from "@/lib";

export const metadata: Metadata = {
  title: "Patient-Profile",
  description: "Patient profile page",
};

export default async function PatientProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkPermissions();
  return children;
}
