import { IconifyIcon } from "@iconify/react";
import { BoxProps, IconButtonProps } from "@mui/material";
import { Breakpoint } from "@mui/system";

import { ModalProviderStates } from "@/contexts/ModalContext";

interface ModalContextOpen {
  title?: string;
  closeOnSubmit?: boolean;
  isSecondary?: boolean;
  fields?: [];
  titleIcon?: string | IconifyIcon;
  modalClassName?: string;
  verticalAlign?: "middle" | "center" | "top";
  size?: Breakpoint | false;
  customRender: () => React.JSX.Element;
  variant?: "compact" | "spaced";
  closeButtonSx?: IconButtonProps["sx"];
  customContentSx?: BoxProps["sx"];
  keepMounted?: boolean;
  key?: string | number;
}

type ReducerModalProviderStates = (
  state: ModalProviderStates,
  action: UseModalStatesContext
) => ModalProviderStates;

type UseModalStatesContext =
  ActionMap<UseModalProviderStatesActionData>[keyof ActionMap<UseModalProviderStatesActionData>];

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? { type: Key; data?: M[Key] }
    : { type: Key; data: M[Key] };
};

type UseModalProviderStatesActionData = {
  SET_OPEN: ModalContextOpen;
  SET_EDIT: ModalContextOpen & { currentItem?: any; Id: number };
  SET_CLOSE: undefined;
  KEEP_MOUNTED: ModalContextOpen;
};

interface SecondaryModalComponentProps {
  state: ModalProviderStates;
  handleClose: VoidFunction;
}

interface ModalComponentProps
  extends Pick<
    ModalProviderStates,
    | "size"
    | "scroll"
    | "verticalAlign"
    | "isOpened"
    | "title"
    | "titleIcon"
    | "customRender"
    | "modalClassName"
  > {
  handleClose: VoidFunction;
  variant?: "spaced" | "compact";
  closeButtonSx?: IconButtonProps["sx"];
  customContentSx?: BoxProps["sx"];
  keepMounted?: boolean;
  key?: string | number;
}

interface CloseButtonProps extends IconButtonProps {
  handleClose: VoidFunction;
}
