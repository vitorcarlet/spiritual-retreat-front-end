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
  noBreadCrumbs: boolean;
};

type BreadCrumbsState = {
  title: string | null;
  pathname: string;
};

const BreadCrumbsContext = createContext<BreadCrumbsContextProps>({
  title: null,
  pathname: "",
  setBreadCrumbsTitle: () => {},
  noBreadCrumbs: false,
});

export const useBreadCrumbs = () => useContext(BreadCrumbsContext);

interface BreadCrumbsProviderProps {
  children: React.ReactNode;
  noBreadCrumbs?: boolean;
}

export const BreadCrumbsProvider = ({
  noBreadCrumbs,
  children,
}: BreadCrumbsProviderProps) => {
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
        noBreadCrumbs: noBreadCrumbs || false,
      }}
    >
      {children}
    </BreadCrumbsContext.Provider>
  );
};
