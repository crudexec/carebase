"use client";

import { Button } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px] flex-col space-y-2 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
          Something Went Wrong!
        </h1>
        <p className="text-gray-500">{error.message}</p>
      </div>
      <Button className="w-full max-w-xs" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}
