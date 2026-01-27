"use client";

import axios from "axios";
import { useRouter } from "next-nprogress-bar";
import React, { PropsWithChildren, useContext } from "react";
import toast from "react-hot-toast";

import { useLocalStorage } from "@/hooks";
import { ISetState, UserResponse } from "@/types";

export const AuthContext = React.createContext<{
  authUser: (UserResponse & { image: string; role?: string }) | null;
  updateUser: ISetState<
    (UserResponse & { image: string; role?: string }) | null
  >;
  logout: () => Promise<void>;
  clearStorage: () => void;
}>({
  authUser: null,
  updateUser: () => null,
  logout: () => Promise.resolve(),
  clearStorage: Function,
});

const AppStateProvider = ({ children }: PropsWithChildren) => {
  const { state, setState, removeItem } = useLocalStorage<
    (UserResponse & { image: string; role?: string }) | null
  >("authUser", null);

  const router = useRouter();
  const logout = async () => {
    await axios.post("/api/auth/logout");
    toast.success("Logged out successfully");
    removeItem();
    router.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        authUser: state,
        updateUser: setState,
        logout,
        clearStorage: removeItem,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AppStateProvider;
