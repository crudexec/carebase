"use client";

import { Button } from "@/components/ui";

export default function GlobalError() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <html lang="en">
      <body
        className={"min-h-screen flex flex-col p-4 pt-12 w-full justify-center"}
      >
        <div className="flex items-center justify-center min-h-[400px] flex-col space-y-2 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Something Went Wrong!
            </h1>
          </div>
          <Button className="w-full max-w-xs mt-4" onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      </body>
    </html>
  );
}
