"use client";
import { createContext, useContext, useState } from "react";

const BreadCrumbsContext = createContext<{
  breadCrumbsTitle: string | null;
  setBreadCrumbsTitle: (title: string | null) => void;
}>({
  breadCrumbsTitle: null,
  setBreadCrumbsTitle: () => {},
});

export const useBreadCrumbs = () => useContext(BreadCrumbsContext);

interface BreadCrumbsProviderProps {
  children: React.ReactNode;
}

export const BreadCrumbsProvider = ({ children }: BreadCrumbsProviderProps) => {
  const [breadCrumbsTitle, setBreadCrumbsTitle] = useState<string | null>(null);

  return (
    <BreadCrumbsContext.Provider
      value={{ breadCrumbsTitle, setBreadCrumbsTitle }}
    >
      {children}
    </BreadCrumbsContext.Provider>
  );
};
