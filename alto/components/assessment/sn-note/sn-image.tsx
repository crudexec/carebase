import { StaticImageData } from "next/image";

import { StaticImage } from "@/components/static-image";

const SNImage = ({
  title,
  image,
}: {
  title: string;
  image: StaticImageData | string;
}) => {
  return (
    <div className="flex flex-col justify-center items-center">
      <StaticImage
        src={image}
        alt="sn-note"
        imageClassName={"object-contain"}
        className=" h-[200px] w-[200px]"
      />
      <p className="uppercase text-sm font-semibold">{title}</p>
    </div>
  );
};

export default SNImage;
