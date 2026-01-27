import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Unscheduled-Visit",
    template: "Unscheduled-Visit | %s",
  },
  description: "Patient unscheduled visit page",
};
export default async function UnscheduledVisitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
