
"use client";

import { ReactNode } from "react";

const PageContainer = ({ children }: { children: ReactNode }) => {
  return (
    <main className="flex flex-col gap-10 px-4 py-12 mx-auto max-w-full lg:px-8 xl:px-12 2xl:max-w-screen-2xl">
      {children}
    </main>
  );
};

export default PageContainer;
