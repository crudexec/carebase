"use client";

import React, { PropsWithChildren, useContext } from "react";

import { useLocalStorage } from "@/hooks";

export const StateContext = React.createContext<{
  navOpen: boolean;
  toggleNav: () => void;
  closeNav: () => void;
}>({
  navOpen: false,
  toggleNav: () => null,
  closeNav: () => null,
});

const AppStateProvider = ({ children }: PropsWithChildren) => {
  const { state: sideNav, setState: setNav } = useLocalStorage<{
    state: string;
  } | null>("sideNav", null);

  const toggleNav = () => {
    setNav(
      sideNav?.state === "opened" ? { state: "closed" } : { state: "opened" },
    );
  };

  const closeNav = () => {
    setNav({ state: "closed" });
  };

  return (
    <StateContext.Provider
      value={{ navOpen: sideNav?.state === "opened", toggleNav, closeNav }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => useContext(StateContext);

export default AppStateProvider;
