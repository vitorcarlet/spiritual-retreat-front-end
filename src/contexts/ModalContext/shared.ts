import { ModalProviderStates } from ".";

export const getModalComponentProps = (state: ModalProviderStates) => {
  return {
    size: state.size,
    scroll: state.scroll,
    verticalAlign: state.verticalAlign,
    variant: state.variant,
    keepMounted: state.keepMounted,
    customRender: state.customRender,
    title: state.title,
    titleIcon: state.titleIcon,
    modalClassName: state.modalClassName,
    customContentSx: state.customContentSx,
    closeButtonSx: state.closeButtonSx,
    isOpened: state.isOpened,
  };
};
