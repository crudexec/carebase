import { Metadata } from "next";

import { checkPermissions } from "@/lib";

export const metadata: Metadata = {
  title: "QA Manager",
  description: "QA manager page",
};

export default async function QAManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkPermissions();
  return children;
}
