"use client";

import { RequestType } from "../types";
import { RequestTable } from "./RequestTable";
import Loader from "@/components/Loader";

const RequestWrapper = ({
  requests,
  allRequestsLoading,
}: {
  requests: RequestType[];
  allRequestsLoading: boolean;
}) => {
  if (allRequestsLoading) {
    return <Loader height="h-[80vh]" />;
  }

  return (
    <section className="flex flex-col gap-10">
      <RequestTable data={requests} />
    </section>
  );
};

export default RequestWrapper;
