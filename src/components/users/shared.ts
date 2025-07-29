import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import { UserObject } from "next-auth";

export const fetchUserData = async (
  userId: string
): Promise<UserObject | null> => {
  try {
    const result = await handleApiResponse<UserObject>(
      await sendRequestServerVanilla.get(`/api/user/${userId}`, {
        baseUrl: "http://localhost:3001", // URL do MSW
      })
    );

    if (result.success && result.data) {
      return result.data;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    return null;
  }
};
