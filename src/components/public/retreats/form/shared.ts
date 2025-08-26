import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import { BackendForm } from "./types";

export const fetchFormData = async (
  retreatId: string
): Promise<BackendForm> => {
  try {
    const result = await handleApiResponse<BackendForm>(
      await sendRequestServerVanilla.get(
        `/api/public/retreats/${retreatId}/form/participant`,
        {
          baseUrl: "http://localhost:3001", // URL do MSW
        }
      )
    );

    if (result.success && result.data) {
      return result.data as BackendForm;
    }
    return {} as BackendForm;
  } catch (error) {
    console.error("Erro ao buscar dados do formulario:", error);
    return {} as BackendForm;
  }
};

export const defaultValues: Record<string, any> = {
  fullName: "",
  email: "",
  phone: "",
  birthDate: "",
  address: {
    street: "",
    city: "",
    state: "",
    zip: "",
  },
};
