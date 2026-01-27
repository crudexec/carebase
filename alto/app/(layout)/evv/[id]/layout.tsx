import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Patient",
    template: "Patient | %s",
  },
  description: "Patient evv details page",
};

export default async function PatientEvvLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
