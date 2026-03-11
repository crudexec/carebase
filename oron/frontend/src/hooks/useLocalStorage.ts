"use client";

import { useState } from "react";

// Type for the value stored in local storage
type LocalStorageValue<T> = T | string | null;

// Define the return value interface as a generic type
interface ReturnValue<T> {
  storedValue: LocalStorageValue<T>;
  setValue: (value: T) => void;
  removeValue: () => void;
  clearLocalStorage: () => void;
}

const useLocalStorage = <T>(key: string): ReturnValue<T> => {
  // Retrieve the initial value from local storage or use null if not present
  const initialValue: LocalStorageValue<T> =
    typeof window !== "undefined" ? localStorage.getItem(key) : null;

  // State to hold the current value
  const [storedValue, setStoredValue] =
    useState<LocalStorageValue<T>>(initialValue);

  // Function to set a new value in local storage and update the state
  const setValue = (value: T) => {
    // Update the state
    setStoredValue(value);
    // Update local storage
    typeof window !== "undefined" && localStorage.setItem(key, value as string);
  };

  // Function to remove the value from local storage and reset the state
  const removeValue = () => {
    // Remove from state
    setStoredValue(null);
    // Remove from local storage
    typeof window !== "undefined" && localStorage.removeItem(key);
  };

  const clearLocalStorage = () => {
    localStorage.clear();
  };

  // Return the state value and functions to set and remove it
  return { storedValue, setValue, removeValue, clearLocalStorage };
};

export default useLocalStorage;
