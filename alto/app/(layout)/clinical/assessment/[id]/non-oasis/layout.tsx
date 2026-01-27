"use client";

import { ReactNode, useEffect } from "react";
import { FaChevronLeft } from "react-icons/fa6";

import SubSideLinksGroup from "@/components/sidebar/sub-sidebar/links-group";
import { useAppState } from "@/context/StateContext";
import { useDisclosure, useMediaQuery, useQueryParams } from "@/hooks";
import { cn, createReqQuery } from "@/lib";

function NavbarSearch({ children }: { children: ReactNode }) {
  const { opened, toggle } = useDisclosure(true);
  const { closeNav } = useAppState();
  const matches = useMediaQuery("(max-width: 768px)");
  const [dateCompleted] = useQueryParams("date", { defaultValue: null });
  const [action] = useQueryParams("action", { defaultValue: null });
  const [assessmentId] = useQueryParams("assessmentId", { defaultValue: null });

  useEffect(() => {
    closeNav();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const query = createReqQuery({ date: dateCompleted, action, assessmentId });

  const collections = [
    {
      icon: "📊",
      label: "Patient Tracking",
      link: `/patient-tracking?${query}`,
    },
    {
      icon: "👤",
      label: "History/Diagnosis",
      initiallynavOpen: false,
      link: `/history-diagnosis?${query}`,
    },
    {
      icon: "➕",
      label: "Living",
      initiallynavOpen: false,
      links: [
        {
          icon: "📝",
          label: "Living/Family/Financial",
          link: `/living?${query}`,
        },
      ],
    },
  ];

  const links = collections.map((item) => (
    <SubSideLinksGroup
      {...item}
      key={item.label}
      close={matches ? toggle : () => null}
    />
  ));

  return (
    <div>
      <div className="fixed h-screen flex ml-3 z-[49]">
        {/* side nav */}
        <div
          className={cn(
            "h-full overflow-x-hidden transition-width duration-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            opened ? "w-[320px] border-x border-x-border/60" : "w-0",
          )}
        >
          <div className="pt-3 pb-5">{links}</div>
        </div>

        {/* toggleNav icon */}
        <div
          className={cn(
            "w-6 pt-4 bg-transparent",
            !opened && "border-r-border border-r w-4",
          )}
          onClick={toggle}
        >
          <div
            className={cn(
              "w-fit h-fit bg-background hover:bg-foreground hover:text-background cursor-pointer absolute rounded-full p-1 shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] border-border border",
              opened
                ? "right-3"
                : "-right-3 transform rotate-180 transition-transform duration-300",
            )}
          >
            <FaChevronLeft size="0.8rem" />
          </div>
        </div>
      </div>
      <div
        className={cn(
          "flex-1 min-h-[calc(100vh-65px)] relative overflow-x-hidden transition-margin duration-300",
          opened ? "md:ml-[350px]" : "ml-7",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default NavbarSearch;
