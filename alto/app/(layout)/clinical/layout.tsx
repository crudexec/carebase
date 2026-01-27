import { Metadata } from "next";

import { checkPermissions } from "@/lib";

export const metadata: Metadata = {
  title: {
    default: "Clinical",
    template: "Clinical | %s",
  },
  description: "Clinical Assessment page",
};
export default async function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkPermissions(["administrator", "caregiver"]);
  return children;
}
