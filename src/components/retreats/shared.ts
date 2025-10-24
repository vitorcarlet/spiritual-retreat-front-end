import apiClient from "@/src/lib/axiosClientInstance";
import { Retreat } from "@/src/types/retreats";
import axios from "axios";

type RetreatPayload = {
  id?: string;
  name: string;
  edition: string;
  theme: string;
  startDate: string;
  endDate: string;
  registrationStart: string;
  registrationEnd: string;
  feeFazer: number;
  feeServir: number;
  stateShort?: string;
  city?: string;
  location?: string;
  description?: string;
  instructor?: string;
  capacity?: number;
  maleSlots?: number;
  femaleSlots?: number;
  westRegionPct?: number;
  otherRegionPct?: number;
  imagesToDelete?: (string | number)[];
};

export const fetchRetreatData = async (
  retreatId: string
): Promise<Retreat | null> => {
  try {
    const result = await apiClient.get(`/Retreats/${retreatId}`);
    return result.data;
  } catch (error) {
    console.error("Erro ao buscar dados do retiro:", error);
    throw error;
  }
};

const buildRetreatPayload = (data: RetreatPayload) => {
  return {
    id: data.id,
    name: {
      value: data.name,
    },
    edition: data.edition,
    theme: data.theme,
    startDate: data.startDate,
    endDate: data.endDate,
    maleSlots: data.maleSlots ?? 60,
    femaleSlots: data.femaleSlots ?? 60,
    registrationStart: data.registrationStart,
    registrationEnd: data.registrationEnd,
    feeFazer: {
      amount: typeof data.feeFazer === "number" ? data.feeFazer : 0,
      currency: "BRL",
    },
    feeServir: {
      amount: typeof data.feeServir === "number" ? data.feeServir : 0,
      currency: "BRL",
    },
    westRegionPct: {
      value: typeof data.westRegionPct === "number" ? data.westRegionPct : 85.0,
    },
    otherRegionPct: {
      value:
        typeof data.otherRegionPct === "number" ? data.otherRegionPct : 15.0,
    },
  };
};

export const createRetreat = async (
  payload: RetreatPayload,
  files?: File[]
): Promise<Retreat> => {
  try {
    const builtPayload = buildRetreatPayload(payload);

    if (files && files.length > 0) {
      const body = new FormData();
      body.append(
        "payload",
        new Blob([JSON.stringify(builtPayload)], { type: "application/json" })
      );
      files.forEach((file) => body.append("images", file));

      const response = await apiClient.post<Retreat>("/Retreats", body);
      return response.data;
    }

    const response = await apiClient.post<Retreat>("/Retreats", builtPayload);
    return response.data;
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? (error.response?.data as { error?: string })?.error ?? error.message
      : "Erro ao criar retiro. Tente novamente.";
    throw new Error(message);
  }
};

export const updateRetreat = async (
  retreatId: string,
  payload: RetreatPayload,
  files?: File[]
): Promise<Retreat> => {
  try {
    const builtPayload = buildRetreatPayload({ id: retreatId, ...payload });

    if (files && files.length > 0) {
      const body = new FormData();
      body.append(
        "payload",
        new Blob([JSON.stringify(builtPayload)], { type: "application/json" })
      );
      files.forEach((file) => body.append("images", file));

      const response = await apiClient.put<Retreat>(
        `/Retreats/${retreatId}`,
        body
      );
      return response.data;
    }

    const response = await apiClient.put<Retreat>(
      `/Retreats/${retreatId}`,
      builtPayload
    );
    return response.data;
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? (error.response?.data as { error?: string })?.error ?? error.message
      : "Erro ao atualizar retiro. Tente novamente.";
    throw new Error(message);
  }
};

export const deleteRetreat = async (retreatId: string): Promise<void> => {
  try {
    await apiClient.delete(`/Retreats/${retreatId}`);
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? (error.response?.data as { error?: string })?.error ?? error.message
      : "Erro ao excluir retiro. Tente novamente.";
    throw new Error(message);
  }
};
