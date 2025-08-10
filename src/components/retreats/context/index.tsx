import React, { createContext, useContext, useState, ReactNode } from "react";

type RetreatContentContextType = {
  Retreat: Retreat | null;
  setRetreat: (Retreat: Retreat | null) => void;
};

const RetreatContentContext = createContext<RetreatContentContextType | null>(null);

type RetreatContentProviderProps = {
  Retreat: Retreat | null;
  children: ReactNode;
};

export const RetreatContentProvider = ({
  Retreat: RetreatResponse,
  children,
}: RetreatContentProviderProps) => {
  const [Retreat, setRetreat] = useState<Retreat | null>(RetreatResponse);

  return (
    <RetreatContentContext.Provider value={{ Retreat, setRetreat }}>
      {children}
    </RetreatContentContext.Provider>
  );
};

export const useRetreatContent = () => {
  const context = useContext(RetreatContentContext);
  if (!context) {
    throw new Error("useRetreatContent must be used within a RetreatContentProvider");
  }
  return context;
};
