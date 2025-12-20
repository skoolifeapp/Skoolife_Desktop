import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

type LayoutSidebarContextValue = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
};

const LayoutSidebarContext = createContext<LayoutSidebarContextValue | undefined>(undefined);

export function LayoutSidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((v) => !v);
  }, []);

  const value = useMemo(
    () => ({ sidebarCollapsed, setSidebarCollapsed, toggleSidebarCollapsed }),
    [sidebarCollapsed, toggleSidebarCollapsed],
  );

  return <LayoutSidebarContext.Provider value={value}>{children}</LayoutSidebarContext.Provider>;
}

export function useLayoutSidebar() {
  const ctx = useContext(LayoutSidebarContext);
  if (!ctx) throw new Error("useLayoutSidebar must be used within a LayoutSidebarProvider");
  return ctx;
}
