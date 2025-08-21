import { defaultDropAnimationSideEffects, DropAnimation } from "@dnd-kit/core";

export const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};
