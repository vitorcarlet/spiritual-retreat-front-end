"use client";
import { getPermissionByPathname } from "@/src/components/users/shared";
import useAllowEdit from "@/src/hooks/useAllowEdit";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

type MenuModeContextValues = {
  menuMode: "view" | "edit" | null;
  toggleMenuMode: (value: "view" | "edit" | null) => void;
  isAllowedToEdit: boolean;
};

const MenuModeContext = createContext<MenuModeContextValues | null>(null);

const MenuModeProvider = ({
  children,
  mode = "view",
}: {
  children: React.ReactNode;
  mode?: "view" | "edit" | null;
}) => {
  const [menuMode, setMenuMode] = useState<"view" | "edit" | null>(mode);
  const pathname = usePathname();
  const { allowEdit } = useAllowEdit({
    permission: getPermissionByPathname(pathname),
  });

  const toggleMenuMode = (value: typeof menuMode) => {
    if (!allowEdit) return;
    setMenuMode(value);
  };
  useEffect(() => {
    if (!allowEdit) setMenuMode("view");
    setMenuMode(mode);
  }, [mode]);

  return (
    <MenuModeContext.Provider
      value={{ menuMode, toggleMenuMode, isAllowedToEdit: allowEdit }}
    >
      {children}
    </MenuModeContext.Provider>
  );
};

const useMenuMode = () => {
  const context = useContext(MenuModeContext);
  if (!context) {
    throw new Error("useMenuMode must be used within a MenuModeProvider");
  }
  return context;
};

export { MenuModeProvider, useMenuMode };
