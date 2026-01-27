import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assessment",
  description: "Assessment page",
};
export default async function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
