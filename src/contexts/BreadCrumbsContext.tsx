"use client";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

type BreadCrumbsContextProps = {
  title: string | null;
  pathname: string;
  setBreadCrumbsTitle: Dispatch<SetStateAction<BreadCrumbsState>>;
};

type BreadCrumbsState = {
  title: string | null;
  pathname: string;
};

const BreadCrumbsContext = createContext<BreadCrumbsContextProps>({
  title: null,
  pathname: "",
  setBreadCrumbsTitle: () => {},
});

export const useBreadCrumbs = () => useContext(BreadCrumbsContext);

interface BreadCrumbsProviderProps {
  children: React.ReactNode;
}

export const BreadCrumbsProvider = ({ children }: BreadCrumbsProviderProps) => {
  const [breadCrumbsTitle, setBreadCrumbsTitle] = useState<BreadCrumbsState>({
    title: null,
    pathname: "",
  });

  return (
    <BreadCrumbsContext.Provider
      value={{
        title: breadCrumbsTitle.title,
        pathname: breadCrumbsTitle.pathname,
        setBreadCrumbsTitle,
      }}
    >
      {children}
    </BreadCrumbsContext.Provider>
  );
};
