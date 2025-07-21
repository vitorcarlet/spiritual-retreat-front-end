// src/contexts/DrawerContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface DrawerContextType {
  isDrawerOpen: boolean;
  drawerWidth: number;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const drawerWidth = 280; // Largura fixa do drawer

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const setDrawerOpen = useCallback((open: boolean) => {
    setIsDrawerOpen(open);
  }, []);

  return (
    <DrawerContext.Provider
      value={{
        isDrawerOpen,
        drawerWidth,
        toggleDrawer,
        setDrawerOpen,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
}

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within DrawerProvider");
  }
  return context;
};
