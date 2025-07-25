// src/contexts/DrawerContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface DrawerContextType {
  mobileOpen: boolean;
  drawerWidth: number;
  handleDrawerClose: () => void;
  handleDrawerTransitionEnd: () => void;
  handleDrawerToggle: () => void;
  handleDrawerPersistentToggle: () => void;
  openPersistent: boolean;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  //const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openPersistent, setOpenPersistent] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const drawerWidth = 240; // Largura fixa do drawer

  const handleDrawerPersistentToggle = useCallback(() => {
    setOpenPersistent((prev) => !prev);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setIsClosing(true);
    setMobileOpen(false);
  }, []);

  const handleDrawerTransitionEnd = useCallback(() => {
    setIsClosing(false);
  }, []);

  const handleDrawerToggle = useCallback(() => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  }, [isClosing, mobileOpen]);

  return (
    <DrawerContext.Provider
      value={{
        handleDrawerTransitionEnd,
        handleDrawerToggle,
        handleDrawerClose,
        mobileOpen,
        drawerWidth,
        openPersistent,
        handleDrawerPersistentToggle,
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
