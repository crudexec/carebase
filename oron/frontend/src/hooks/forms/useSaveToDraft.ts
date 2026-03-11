"use client";

import { useState, useCallback } from "react";

type DraftData<T> = {
  key: string;
  data: T | null;
};

function useSaveToDraft<T>(storage: Storage = localStorage) {
  const [draft, setDraft] = useState<DraftData<T>>({ key: "", data: null });

  const saveToDraft = useCallback(
    (key: string, item: T) => {
      try {
        setDraft({ key, data: item });
        storage.setItem(key, JSON.stringify(item));
      } catch (error: any) {
        throw new Error("Error saving draft", error);
      }
    },
    [storage]
  );

  const retrieveDraft = useCallback(
    (key: string): T | null => {
      try {
        const savedData = storage.getItem(key);
        if (savedData) {
          return JSON.parse(savedData) as T;
        }
      } catch (error: any) {
        throw new Error("Error retrieving draft", error);
      }
      return null;
    },
    [storage]
  );

  return {
    data: draft.data,
    saveToDraft,
    retrieveDraft,
  };
}

export default useSaveToDraft;
