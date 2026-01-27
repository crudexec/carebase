"use client";
import { useEffect, useState } from "react";

const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T | null>(null);
  const [removeStoredValue, setRemoveStoredValue] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const item = window.localStorage.getItem(key);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStoredValue(item ? JSON.parse(item) : initialValue);
  }, [key, initialValue]);

  useEffect(() => {
    const setValue = (value: T) => {
      window.localStorage.setItem(key, JSON.stringify(value));
    };

    if (removeStoredValue) {
      window.localStorage.removeItem(key);
      /* eslint-disable react-hooks/set-state-in-effect */
      setRemoveStoredValue(false);
      setStoredValue(null);
      /* eslint-enable react-hooks/set-state-in-effect */
    } else if (storedValue) {
      setValue(storedValue);
    }
  }, [storedValue, key, removeStoredValue, initialValue]);

  const removeItem = () => {
    setRemoveStoredValue(!removeStoredValue);
  };

  return { state: storedValue, setState: setStoredValue, removeItem };
};

export default useLocalStorage;
