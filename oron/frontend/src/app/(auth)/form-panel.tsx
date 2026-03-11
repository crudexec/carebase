"use client";

import { ReactNode } from "react";
import Image from "next/image";

const FormPanel = ({ children }: { children: ReactNode }) => {
  return (
    <section className="bg-white lg:ml-auto h-full w-full lg:w-[50%] xl:w-[45%] p-5 flex flex-col overflow-auto">
      <div className="w-full h-full flex flex-col">
        <Image
          src="/assets/images/logo.svg"
          width={150}
          height={50}
          alt="creed logo"
        />

        <div className="w-full flex justify-center items-center lg:mx-auto mt-20 lg:my-auto lg:py-10">
          {children}
        </div>
      </div>
    </section>
  );
};

export default FormPanel;
