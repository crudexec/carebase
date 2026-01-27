import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skilled Nursing Note",
  description: "Skilled Nursing Note page",
};

export default async function SkilledNursingNoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
