"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MenuIcon, Loader2, XIcon } from "lucide-react";
import useSidebar from "@/hooks/useSidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { useRouter, usePathname } from "next/navigation";
import { useToast } from "./ui/use-toast";
import useLocalStorage from "@/hooks/useLocalStorage";
import useUser from "@/hooks/useUser";
import Loader from "./Loader";
import type { User } from "@/types/UserTypes";
import { capitalizeFirstLetter } from "@/utils";

const formatUserRole = (role: string) => {
  switch (role) {
    case "ADMINISTRATOR":
      return "Admin";
    case "STANDARD":
      return "Employee";
    default:
      return "Admin";
  }
};

const ProfileDropdown = ({ user }: { user: User | undefined }) => {
  const pathname = usePathname();
  const isAdmin = pathname.includes("admin");

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { clearLocalStorage } = useLocalStorage<string>("token");

  const handleLogout = () => {
    setDialogOpen(false);
    setIsLoading(true);
    toast({
      description: "Logging you out",
    });
    clearLocalStorage();
    router.push("/login");
  };

  return (
    <div className="flex">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start gap-2">
            <Image
              src="/assets/images/dashboard/emptyProfilePicture.svg"
              width={35}
              height={35}
              alt="avatar"
            />

            <div className="flex flex-col items-start">
              <h4 className="text-[#344054] text-[15px] font-[500]">
                {capitalizeFirstLetter(
                  `${user?.data?.first_name ?? "_"} ${
                    user?.data?.last_name ?? "_"
                  }`
                )}
              </h4>
              <span className="text-[10px] font-[400] text-[#98A2B3]">
                {formatUserRole(user?.data?.role ?? "-")}
              </span>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-2 flex flex-col gap-3">
          <DropdownMenuItem>
            <Link
              className="flex items-center gap-2"
              href={isAdmin ? "/admin/settings" : "/settings"}
            >
              <Image
                src="/assets/images/settings.svg"
                width={20}
                height={20}
                alt="settings"
              />
              <span className="text-[#475467] text-[14px] font-[400]">
                Settings
              </span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setDialogOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Image
              src="/assets/images/logoutIcon.svg"
              width={20}
              height={20}
              alt="log out"
            />
            <span className="text-[#475467] text-[14px] font-[400]">
              Log out
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mx-auto">
              <Image
                src="/assets/images/logoutModalIcon.svg"
                width={50}
                height={50}
                alt="logoutModalIcon"
              />
            </DialogTitle>
            <DialogDescription className="text-[18px] font-[500] text-[#101828] text-center pt-3">
              <span>Are you sure you want to </span>{" "}
              <span className="font-[700]">Log Out?</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-3 flex items-center gap-5">
            <DialogClose
              asChild
              className="w-full h-fit p-2 rounded-[6px] bg-[#F1F5F9] text-black"
            >
              Cancel
            </DialogClose>
            <button
              disabled={isLoading}
              onClick={handleLogout}
              className="w-full h-fit p-2 rounded-[6px] bg-[#EF4444] text-white disabled:cursor-not-allowed disabled:bg-[#ef444498] flex items-center justify-center gap-3"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              Log Out
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Header = () => {
  const { data, isLoading } = useUser();
  const { openSidebar, closeSidebar, isSidebarOpen } = useSidebar();

  return (
    <header className="fixed top-0 right-0 h-[70px] bg-white border-b border-gray-300 z-50 flex items-center justify-between lg:justify-end w-full lg:w-[calc(100%-280px)] transition-all duration-300 ease-in-out">
      {isSidebarOpen ? (
        <button onClick={closeSidebar} className="lg:hidden ml-[290px]">
          <XIcon className="w-5 h-5" />
        </button>
      ) : (
        <button onClick={openSidebar} className="lg:hidden ml-5">
          <MenuIcon className="w-5 h-5" />
        </button>
      )}

      <div
        className={`mr-10 flex gap-10 items-center ${
          isSidebarOpen && "hidden md:flex"
        }`}
      >
        <Link href="#">
          <Image
            src="/assets/images/notification.svg"
            width={17}
            height={17}
            alt="notification"
          />
        </Link>
        {isLoading ? (
          <Loader height="h-fit" />
        ) : (
          <ProfileDropdown user={data} />
        )}
      </div>
    </header>
  );
};

export default Header;
