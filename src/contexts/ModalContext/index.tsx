"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";

import { BoxProps, IconButtonProps } from "@mui/material";
import { usePathname } from "next/navigation";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { reducerModal } from "./reducerModal";
import { ModalContextOpen } from "./types";
import { ModalActions } from "./ModalActions";
import { ModalComponent } from "./ModalComponent";
import { getModalComponentProps } from "./shared";
import type { Breakpoint } from "@mui/system";

type ModalProviderProps = {
  children: ReactNode;
};

export interface ModalProviderStates extends ModalContextOpen {
  /**
   * Id do item que está editando
   */
  Id?: number;

  /**
   * Está aberta a modal
   */
  isOpened: boolean;

  /**
   * Está montada a modal
   */
  isMounted: boolean;

  /**
   * Alinhamento vertical da modal
   */
  verticalAlign?: "middle" | "center" | "top";

  /**
   * Função para abrir a modal passando os valores atuais do estado
   */
  open: (options?: ModalContextOpen) => void;

  /**
   * Função para editar passando os valores atuais do estado e também o id do item
   */
  edit: handleEditFunction;

  /**
   * Fechar a modal
   */
  close: VoidFunction;

  /**
   * Função para destruir a modal
   */
  destroy: VoidFunction;

  onAfterClose: (() => void) | null;
  setOnAfterClose:
    | React.Dispatch<React.SetStateAction<(() => void) | null>>
    | ((callback: (() => void) | null) => void);

  /**
   * index
   */
  index?: number | null;

  /**
   * Item atual
   */
  currentItem: unknown;

  methods: UseFormReturn<FieldValues, unknown>;

  /**
   * Tipo de scroll
   */
  scroll: "body" | "paper";

  closeButtonSx?: IconButtonProps["sx"];
  customContentSx?: BoxProps["sx"];
  keepMounted?: boolean;
  key?: string | number;
}

const ModalContext = createContext<ModalProviderStates>(
  {} as ModalProviderStates
);

export const initialStateModal = {
  Id: 0,
  isOpened: false,
  isMounted: true,
  index: null,
  closeOnSubmit: true,
  verticalAlign: "middle",
  title: "",
  size: "sm",
  scroll: "body",
  customRender: () => {},
} as unknown as ModalProviderStates;

type handleEditFunction = <T>(
  Id: number,
  options?: ModalContextOpen & { currentItem?: T }
) => void;

const ModalProvider = ({ children }: ModalProviderProps) => {
  const pathname = usePathname();
  const [state, dispatch] = useReducer(reducerModal, initialStateModal);
  const prevPath = useRef(pathname);
  const onAfterClose = useRef<(() => void) | null>(null);

  const handleOpen = useCallback((options?: ModalContextOpen) => {
    const { ...data } = options || ({} as ModalContextOpen);
    dispatch({ type: ModalActions.SET_OPEN, data });
  }, []);

  const handleClose = () => {
    if (state.keepMounted) {
      return dispatch({ type: ModalActions.KEEP_MOUNTED });
    }
    dispatch({ type: ModalActions.SET_CLOSE });
  };

  const destroy = useCallback(() => {
    dispatch({ type: ModalActions.SET_CLOSE });
    if (onAfterClose.current) {
      onAfterClose.current();
      onAfterClose.current = null;
    }
  }, []);

  const setOnAfterClose = useCallback((callback: (() => void) | null) => {
    onAfterClose.current = callback;
  }, []);

  type ModalRelevantData = {
    Id?: number;
    currentItem: unknown;
    title?: string;
    size?: false | Breakpoint | undefined;
    index?: number | null;
  };
  const prevModalData = useRef<ModalRelevantData | null>(null);
  useEffect(() => {
    if (prevPath.current !== pathname) {
      destroy();
      prevPath.current = pathname;
    }
  }, [destroy, pathname]);

  useEffect(() => {
    const currentData: ModalRelevantData = {
      Id: state.Id,
      currentItem: state.currentItem,
      title: state.title,
      size: state.size,
      index: state.index,
    };
    const prevData = prevModalData.current;
    if (
      prevData &&
      JSON.stringify(prevData) !== JSON.stringify(currentData) &&
      state.isOpened // Só reabre se deveria estar aberto
    ) {
      destroy();
      handleOpen({ ...state });
    }
    prevModalData.current = currentData;
  }, [
    state.Id,
    state.currentItem,
    state.title,
    state.size,
    state.index,
    state.isOpened,
  ]);

  const modalComponentProps = getModalComponentProps(state);
  return (
    <ModalContext.Provider
      value={{
        ...state,
        open: handleOpen,
        close: handleClose,
        destroy,
        onAfterClose: onAfterClose.current,
        setOnAfterClose,
      }}
    >
      {children}

      <ModalComponent
        key={state.key}
        handleClose={handleClose}
        {...modalComponentProps}
      />
    </ModalContext.Provider>
  );
};

export { ModalProvider, ModalContext };
