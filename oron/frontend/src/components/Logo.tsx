import Image from "next/image";
import React from "react";

const Logo = () => {
  return (
    <Image src="/assets/images/logo.svg" width={150} height={35} alt="Logo" />
  );
};

export default Logo;
