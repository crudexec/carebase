"use client";
import { useState } from "react";

const useDisclosure = (defaultOpen = false) => {
  const [opened, setOpen] = useState(defaultOpen);

  return {
    opened,
    onOpen: () => setOpen(true),
    onClose: () => setOpen(false),
    toggle: () => setOpen((open) => !open),
    setOpen,
  };
};

export default useDisclosure;
