import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Switch Provider",
  description: "Switch provider page",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
