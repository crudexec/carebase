"use client";

import { useEffect, useState } from "react";

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQueryList.addEventListener("change", listener);

    // Set initial state
    setMatches(mediaQueryList.matches);

    return () => mediaQueryList.removeEventListener("change", listener);
  }, [query]);

  return matches;
};

export default useMediaQuery;
