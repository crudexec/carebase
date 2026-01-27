import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evv-Admission",
  description: "Patient evv admission page",
};

export default async function EVVAdmissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
