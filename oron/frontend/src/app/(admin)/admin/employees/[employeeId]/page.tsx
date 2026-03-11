import EmployeeProfileWrapper from "@/components/admin/employee-profile/EmployeeProfileWrapper";

export default function EmployeeProfilePage({
  params,
}: {
  params: { employeeId: string };
}) {
  return <EmployeeProfileWrapper employeeId={params.employeeId} />;
}
