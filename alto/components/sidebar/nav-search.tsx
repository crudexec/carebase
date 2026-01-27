import { FaChevronLeft } from "react-icons/fa6";

import { useAuth } from "@/context/AuthContext";
import { useAppState } from "@/context/StateContext";
import { useMediaQuery } from "@/hooks";
import { cn } from "@/lib";

import LinksGroup from "./links-group";

function NavbarSearch() {
  const { navOpen, toggleNav } = useAppState();
  const matches = useMediaQuery("(max-width: 768px)");
  const { authUser } = useAuth();
  let links;

  const collections = [
    { icon: "📊", label: "Dashboard", link: "/dashboard" },
    { icon: "👤", label: "Users", initiallynavOpen: false, link: "/user" },
    {
      icon: "➕",
      label: "Patients",
      initiallynavOpen: false,
      link: "/patient",
    },
    {
      icon: "📆",
      label: "Scheduling",
      initiallynavOpen: false,
      links: [{ icon: "⏰", label: "Scheduler", link: "/schedule" }],
    },
    {
      icon: "🔗",
      label: "Assessment",
      link: "/assessment",
      initiallynavOpen: false,
    },
    {
      icon: "➕",
      label: "Clinical",
      initiallynavOpen: false,
      links: [
        {
          icon: "📝",
          label: "Skilled Nursing Visit Notes",
          link: "/clinical/sn-note",
        },
        {
          icon: "📑",
          label: "Assessments (OASIS/NON-OASIS)",
          link: "/clinical/assessment",
        },
        {
          icon: "🧾",
          label: "485 - Certification and Plan of Care",
          link: "/clinical/cert485",
        },
        { icon: "🏥", label: "Plan of Care Plus", link: "/clinical/poc" },
      ],
    },
    { icon: "⚕️", label: "EVV", initiallynavOpen: false, link: "/evv" },
    {
      icon: "🔗",
      label: "Quality Assurance",
      link: "/qamanager",
      initiallynavOpen: false,
    },
    {
      icon: "⚙️",
      label: "Settings",
      initiallynavOpen: false,
      links: [{ icon: "🏫", label: "Provider", link: "/settings/provider" }],
    },
  ];

  const careGiverCollections = [
    {
      icon: "➕",
      label: "Clinical",
      initiallynavOpen: false,
      links: [
        {
          icon: "📝",
          label: "Skilled Nursing Visit Notes",
          link: "/clinical/sn-note",
        },
        {
          icon: "🧾",
          label: "485 - Certification and Plan of Care",
          link: "/clinical/cert485",
        },
        { icon: "🏥", label: "Plan of Care Plus", link: "/clinical/poc" },
      ],
    },
    { icon: "⚕️", label: "EVV", initiallynavOpen: false, link: "/evv" },
  ];

  if (authUser?.role === "caregiver") {
    links = careGiverCollections.map((item) => (
      <LinksGroup
        {...item}
        key={item.label}
        close={matches ? toggleNav : () => null}
      />
    ));
  } else {
    links = collections.map((item) => (
      <LinksGroup
        {...item}
        key={item.label}
        close={matches ? toggleNav : () => null}
      />
    ));
  }

  return (
    <div className="fixed z-50 h-screen flex">
      {/* side nav */}
      <div
        className={cn(
          "h-full overflow-x-hidden transition-width duration-30 border-r border-r-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          navOpen ? "w-[350px]" : "w-0",
        )}
      >
        <div className="pt-3 pb-5">{links}</div>
      </div>

      {/* toggleNav icon */}
      <div
        className={cn(
          "w-6 pt-4 bg-transparent",
          !navOpen && "border-r-border border-r w-4",
        )}
        onClick={toggleNav}
      >
        <div
          className={cn(
            "w-fit h-fit bg-background z-[60] hover:bg-foreground hover:text-background cursor-pointer absolute rounded-full p-1 shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] border-border border",
            navOpen
              ? "right-3"
              : "-right-3 transform rotate-180 transition-transform duration-300",
          )}
        >
          <FaChevronLeft size="0.8rem" />
        </div>
      </div>
    </div>
  );
}

export default NavbarSearch;
