import { AxiosRequestConfig, Method } from "axios";

import { AxiosError } from "axios";
import api from "./axiosServerInstance";
import Helpers from "../helpers";

interface Payload {
  id?: number | Array<number>;
  [key: string]: unknown;
}

export type SendRequestFunctionProps = {
  url: string;
  method?: Method;
  payload?: Payload;
  isSilent?: boolean;
};

// type SendRequestFunction = <T>(
//   options: SendRequestFunctionProps
// ) => Promise<AxiosResponse<T, any>>;

export const sendRequestServer = async <T>({
  url,
  method = "get",
  payload,
}: SendRequestFunctionProps): Promise<T> => {
  if (!payload) payload = {};

  payload._method = method;

  try {
    const { data } = await api.post<T>(url, Helpers.objToFormData(payload));
    return data;
  } catch (error: any) {
    error.success = false;
    throw error;
  }
};

type HookOptions = {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: Record<string, any>;
};

export interface ResponseWithMessage {
  errors?: [];
}

export type Error<T> = AxiosError<T, { message: string; status: number }>;
