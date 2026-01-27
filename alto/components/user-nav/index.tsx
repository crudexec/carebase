"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { ImSpinner8 } from "react-icons/im";

import { useAuth } from "@/context/AuthContext";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui";

export function UserNav() {
  const [loading, setLoading] = useState(false);
  const { authUser, logout, clearStorage } = useAuth();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      clearStorage();
      location.href = "/login";
      toast.error(error?.response?.data?.message ?? error?.message);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={loading}>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          {!loading && authUser ? (
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={(authUser?.image as string) || ""}
                alt="@shadcn"
              />
              {authUser?.lastName && authUser?.firstName && (
                <AvatarFallback>
                  {authUser?.lastName.charAt(0)}
                  {authUser?.firstName.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
          ) : (
            <Avatar className="h-8 w-8 items-center justify-center place-items-center bg-border/60">
              <ImSpinner8 className="animate-spin" />
            </Avatar>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        align="end"
        forceMount
        sideOffset={16}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {authUser?.firstName} {authUser?.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {authUser?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
