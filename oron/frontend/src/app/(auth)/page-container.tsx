import { ReactNode } from "react";
import Image from "next/image";

const PageContainer = ({ children }: { children: ReactNode }) => {
  return (
    <main className="bg-[#E2E8F0] w-full h-full md:h-screen flex">
      <div className="md:w-[40%] lg:min-w-[50%] xl:min-w-[55%] h-full hidden lg:flex justify-end">
        <Image
          src="/assets/images/auth/authSideMockup.svg"
          width={500}
          height={800}
          alt="creed logo"
          className="z-10 absolute top-1/2 -translate-y-1/2 xl:w-[45%] lg:w-[45%]"
        />
      </div>

      {children}
    </main>
  );
};

export default PageContainer;
