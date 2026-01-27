"use client";
import { useRouter } from "next-nprogress-bar";
import { ReactNode } from "react";
import { HiSwitchHorizontal } from "react-icons/hi";

import NavbarSearch from "@/components/sidebar/nav-search";
import { Tooltip } from "@/components/ui";
import { ModeToggle } from "@/components/ui/mode-toggler";
import { UserNav } from "@/components/user-nav";
import { useAuth } from "@/context/AuthContext";
import { useAppState } from "@/context/StateContext";
import { cn } from "@/lib";

const NavWrapper = ({ children }: { children: ReactNode }) => {
  const { navOpen } = useAppState();
  const { authUser } = useAuth();
  const router = useRouter();

  const handleSwitch = () => {
    router.push("/select-provider");
  };

  return (
    <div>
      <div className="sticky top-0 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="flex h-16 items-center justify-between px-4">
          <div>AltoHeal</div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            {authUser?.providers && authUser?.providers.length && (
              <Tooltip
                trigger={
                  <div
                    className="border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 rounded-md inline-flex items-center justify-center"
                    onClick={handleSwitch}
                  >
                    <HiSwitchHorizontal className="text-xl" />
                  </div>
                }
              >
                <p>Switch Provider</p>
              </Tooltip>
            )}
            <UserNav />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <NavbarSearch />
        <div
          className={cn(
            "flex-1 min-h-[calc(100vh-65px)] relative overflow-x-hidden transition-margin duration-300",
            navOpen ? "md:ml-[350px]" : "ml-4",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default NavWrapper;
