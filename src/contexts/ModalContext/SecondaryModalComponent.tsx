import { ModalComponent } from "./ModalComponent";
import { SecondaryModalComponentProps } from "./types";

export const SecondaryModalComponent = ({
  state,
  handleClose,
}: SecondaryModalComponentProps) => {
  // Remove a chave `key` do estado antes de passar para o ModalComponent
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { key, ...stateWithoutKey } = state;
  return (
    <ModalComponent
      key={state.key}
      handleClose={handleClose}
      {...stateWithoutKey}
    />
  );
};
