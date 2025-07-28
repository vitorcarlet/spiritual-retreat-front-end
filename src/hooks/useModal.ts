"use client";

import { useContext } from "react";
import { ModalContext, ModalProviderStates } from "../contexts/ModalContext";

type ConsumerModal<T> = Omit<ModalProviderStates, "currentItem"> & {
  currentItem: T | null;
};
type ModalFunction = <T = any>() => ConsumerModal<T>;

export const useModal: ModalFunction = () => useContext(ModalContext);
