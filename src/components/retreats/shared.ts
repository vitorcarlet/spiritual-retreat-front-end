import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import { Retreat } from "@/src/types/retreats";

export const fetchRetreatData = async (
  retreatId: string
): Promise<Retreat | null> => {
  try {
    const result = await handleApiResponse<Retreat>(
      await sendRequestServerVanilla.get(`/retreats/${retreatId}`)
    );

    if (result.success && result.data) {
      return result.data as Retreat;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar dados do retiro:", error);
    return null;
  }
};
