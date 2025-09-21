// src/contexts/DrawerContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";

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
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openPersistent, setOpenPersistent] = useState<boolean>(isDesktop);

  useEffect(() => {
    // Sync persistent drawer with breakpoint
    setOpenPersistent(isDesktop);
    // Always close mobile drawer when entering desktop
    if (isDesktop) setMobileOpen(false);
  }, [isDesktop]);

  const drawerWidth = 240;

  // Mobile drawer controls (no isClosing guard)
  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  // No-op to keep API compatibility
  const handleDrawerTransitionEnd = () => {};

  // Desktop drawer (persistent) toggle
  const handleDrawerPersistentToggle = () => {
    setOpenPersistent((prev) => !prev);
  };

  return (
    <DrawerContext.Provider
      value={{
        mobileOpen,
        drawerWidth,
        handleDrawerClose,
        handleDrawerTransitionEnd,
        handleDrawerToggle,
        handleDrawerPersistentToggle,
        openPersistent,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
}

export const useDrawer = () => {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useDrawer must be used within DrawerProvider");
  return ctx;
};
