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
      await sendRequestServerVanilla.get(`public/retreats/${retreatId}`)
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

export const fetchPublicRetreat = async (
  retreatId: string
): Promise<Retreat | null> => {
  try {
    const result = await handleApiResponse<Retreat>(
      await sendRequestServerVanilla.get(`/public/retreats/${retreatId}`, {
        next: { revalidate: 300 },
        cache: "no-store",
      })
    );

    if (result.success && result.data) {
      return result.data;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar dados do retiro:", error);
    return null;
  }
};
