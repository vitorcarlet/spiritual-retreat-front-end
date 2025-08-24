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

// lib/data.js
import { cache } from "react";

export const getPublicRetreat = cache(async (id: string) => {
  const res = await fetch(`http://localhost:3001/api/public/retreats/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch post");
  }
  return res.json();
});
