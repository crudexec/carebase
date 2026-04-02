"use client";

import * as React from "react";
import {
  TerminologySettings,
  TerminologyKey,
  getTerm,
  getTerms,
  TermOption,
} from "@/lib/terminology";

interface TerminologyContextValue {
  settings: TerminologySettings | null;
  isLoading: boolean;
  /**
   * Get a term by key
   * @param key - The terminology key (visitNote, client, carer, shift)
   * @param plural - Whether to return the plural form
   */
  t: (key: TerminologyKey, plural?: boolean) => string;
  /**
   * Get all terms as an object
   */
  terms: Record<TerminologyKey, TermOption>;
  /**
   * Refresh terminology settings from the server
   */
  refresh: () => Promise<void>;
}

const TerminologyContext = React.createContext<TerminologyContextValue | null>(null);

interface TerminologyProviderProps {
  children: React.ReactNode;
  /**
   * Initial terminology settings (can be passed from server component)
   */
  initialSettings?: TerminologySettings | null;
}

export function TerminologyProvider({
  children,
  initialSettings = null,
}: TerminologyProviderProps) {
  const [settings, setSettings] = React.useState<TerminologySettings | null>(initialSettings);
  const [isLoading, setIsLoading] = React.useState(!initialSettings);

  const fetchTerminology = React.useCallback(async () => {
    try {
      const response = await fetch("/api/settings/terminology");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.terminology || null);
      }
    } catch (error) {
      console.error("Failed to fetch terminology settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!initialSettings) {
      fetchTerminology();
    }
  }, [initialSettings, fetchTerminology]);

  const t = React.useCallback(
    (key: TerminologyKey, plural: boolean = false) => {
      return getTerm(key, plural, settings);
    },
    [settings]
  );

  const terms = React.useMemo(() => getTerms(settings), [settings]);

  const value = React.useMemo(
    () => ({
      settings,
      isLoading,
      t,
      terms,
      refresh: fetchTerminology,
    }),
    [settings, isLoading, t, terms, fetchTerminology]
  );

  return (
    <TerminologyContext.Provider value={value}>
      {children}
    </TerminologyContext.Provider>
  );
}

/**
 * Hook to access terminology settings and helpers
 */
export function useTerminology() {
  const context = React.useContext(TerminologyContext);
  if (!context) {
    throw new Error("useTerminology must be used within a TerminologyProvider");
  }
  return context;
}

/**
 * Hook to get a specific term (convenience wrapper)
 */
export function useTerm(key: TerminologyKey, plural: boolean = false) {
  const { t } = useTerminology();
  return t(key, plural);
}
