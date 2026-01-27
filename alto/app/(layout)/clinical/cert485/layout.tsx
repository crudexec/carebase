import { Metadata } from "next";

export const metadata: Metadata = {
  title: "485 Certification & POC",
  description: "485 Certification & POC page",
};

export default async function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
