"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface SidePanelContextType {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

const SidePanelContext = createContext<SidePanelContextType>({
  open: false,
  toggle: () => {},
  close: () => {},
});

export function SidePanelProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <SidePanelContext.Provider value={{ open, toggle, close }}>
      {children}
    </SidePanelContext.Provider>
  );
}

export function useSidePanel() {
  return useContext(SidePanelContext);
}
