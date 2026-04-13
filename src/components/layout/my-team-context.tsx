"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { TeamInfo } from "@/lib/config";
import { TEAM_BY_SLUG } from "@/lib/config";

interface MyTeamContextType {
  myTeam: TeamInfo | null;
  setMyTeam: (slug: string | null) => void;
}

const MyTeamContext = createContext<MyTeamContextType>({
  myTeam: null,
  setMyTeam: () => {},
});

const STORAGE_KEY = "pdb_meu_time";

export function MyTeamProvider({ children }: { children: React.ReactNode }) {
  const [myTeam, setMyTeamState] = useState<TeamInfo | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && TEAM_BY_SLUG[saved]) {
      setMyTeamState(TEAM_BY_SLUG[saved]);
    }
  }, []);

  const setMyTeam = useCallback((slug: string | null) => {
    if (slug && TEAM_BY_SLUG[slug]) {
      localStorage.setItem(STORAGE_KEY, slug);
      setMyTeamState(TEAM_BY_SLUG[slug]);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setMyTeamState(null);
    }
  }, []);

  return (
    <MyTeamContext.Provider value={{ myTeam, setMyTeam }}>
      {children}
    </MyTeamContext.Provider>
  );
}

export function useMyTeam() {
  return useContext(MyTeamContext);
}
