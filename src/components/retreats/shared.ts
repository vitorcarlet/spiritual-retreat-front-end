import apiClient from "@/src/lib/axiosClientInstance";
import { Retreat } from "@/src/types/retreats";

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
