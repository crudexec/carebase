import { EditIcon } from "@/components/icons";
import Link from "next/link";
import React from "react";

const TreatmentEditButton = ({
  route,
  isTreatment,
}: {
  route: string;
  isTreatment: boolean;
}) => {
  return (
    <Link
      onClick={(e) => e.stopPropagation()}
      href={route}
      className="w-fit mr-5"
    >
      <EditIcon />
    </Link>
  );
};

export default TreatmentEditButton;
