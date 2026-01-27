import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plan of Care Plus",
  description: "Plan of Care Plus page",
};
export default async function POCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
