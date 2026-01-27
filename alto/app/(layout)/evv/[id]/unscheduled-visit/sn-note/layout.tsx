import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SN-Note",
  description: "Patient SN-Note page",
};
export default async function SNNoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
