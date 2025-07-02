import { AxiosRequestConfig, AxiosResponse, Method } from "axios";
import { enqueueSnackbar } from "notistack";
import useSWR, { SWRConfiguration } from "swr";
import { AxiosError } from "axios";
import api from "./axiosInstance";
import Helpers from "../helpers";
import { DefaultResponse } from "../auth/types";

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

type SendRequestFunction = <T>(
  options: SendRequestFunctionProps
) => Promise<AxiosResponse<T, any>>;

export const sendRequest = async <T>({
  url,
  method = "get",
  isSilent,
  payload,
}: SendRequestFunctionProps): Promise<T> => {
  if (!payload) payload = {};

  payload._method = method;

  try {
    const { data } = await api.post<T>(url, Helpers.objToFormData(payload));
    if (!isSilent && (data as DefaultResponse)?.message) {
      enqueueSnackbar((data as DefaultResponse).message, {
        variant: "success",
        preventDuplicate: true,
      });
    }

    if ((data as DefaultResponse)?.alert) {
      enqueueSnackbar((data as DefaultResponse).alert, {
        variant: "warning",
        autoHideDuration: 8000,
      });
    }

    return data;
  } catch (error: any) {
    if (!isSilent) {
      enqueueSnackbar(error?.message || "ocorreu um erro na requisição", {
        variant: "error",
        autoHideDuration: 8000,
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
    }

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

export type UseRequestSWRProps = SWRConfiguration & {
  url: string;
  silent?: boolean;
  queryKey?: string;
  stopRequest?: boolean;
  method?: Method;
  options?: HookOptions;
};

/**
 * @description Hook to make requests to the API using axios and swr
 * @param url - The url to make the request
 * @param silent - If the request should show a snackbar with the response message
 * @param method - The method to make the request
 */
export function useRequestSWR<T>({
  url = "/set-a-url",
  method = "GET",
  silent = false,
  stopRequest = false,
  options,
  queryKey,
  ...SWROptions
}: UseRequestSWRProps) {
  const axiosConfig: AxiosRequestConfig = {
    method,
    url,
    headers: options?.headers,
    params: options?.params,
    data: options?.data,
  };

  const fetcher = async () => {
    const response = await api(axiosConfig)
      .then((response) => {
        if (!silent && response.data?.message) {
          enqueueSnackbar(response.data.message, {
            variant: "success",
            preventDuplicate: true,
          });
        }
        return response;
      })
      .catch((error) => {
        const axiosError = error as AxiosError<T>;

        if (!silent) {
          enqueueSnackbar(axiosError.message, {
            variant: "error",
            autoHideDuration: 8000,
            preventDuplicate: true,
          });
        }

        throw axiosError;
      });

    return response?.data;
  };

  const key = stopRequest ? null : queryKey ?? url;

  const request = useSWR<T, Error<T>>(key, fetcher, {
    ...SWROptions,
    revalidateIfStale: false,
    revalidateOnFocus: false,
  });

  return request;
}
