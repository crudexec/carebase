"use client";

import { createContext, useState, ReactNode, useMemo } from "react";

interface EventContextType {
  tab: "upcoming" | "requests";
  setTab: (tab: "upcoming" | "requests") => void;
}

export const EventContext = createContext<EventContextType | undefined>(
  undefined
);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [tab, setTab] = useState<"upcoming" | "requests">("upcoming");

  const contextValue = useMemo(
    () => ({
      tab,
      setTab: (tab: "upcoming" | "requests") => setTab(tab),
    }),
    [tab]
  );

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
};
