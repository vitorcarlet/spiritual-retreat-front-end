import { initialStateModal, ModalProviderStates } from ".";
import { UseModalStatesContext } from "./types";

export const reducerModal = (
  state: ModalProviderStates,
  { type, data }: UseModalStatesContext
): ModalProviderStates => {
  switch (type) {
    case "SET_OPEN":
      return { ...state, ...data, currentItem: null, isOpened: true };
    case "SET_CLOSE":
      return {
        ...state,
        ...initialStateModal,
        isOpened: false,
        isMounted: true,
      };
    case "KEEP_MOUNTED":
      return { ...state, isOpened: false, isMounted: true };

    default:
      return state;
  }
};
