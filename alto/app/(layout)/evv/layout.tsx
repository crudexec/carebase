import { Metadata } from "next";

import { checkPermissions } from "@/lib";

export const metadata: Metadata = {
  title: {
    default: "Evv",
    template: "Evv | %s",
  },
  description: "Electronic visit verification page",
};
export default async function EvvLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkPermissions(["administrator", "caregiver"]);
  return children;
}
