"use client";

import { useContext } from "react";
import { EventContext } from "./event-context";

const useEvent = () => {
  const eventContext = useContext(EventContext);

  if (!eventContext) {
    throw new Error("useEvent must be used within a EventProvider");
  }

  const { tab, setTab } = eventContext;

  return { tab, setTab };
};

export default useEvent;
