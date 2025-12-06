/**
 * Módulo de ações de contemplação
 *
 * Funções extraídas para permitir testes unitários independentes.
 * Estas funções gerenciam a contemplação e remoção de contemplação de participantes.
 */

import axios from "axios";

/**
 * Dependências injetáveis para as funções de contemplação
 */
export interface ContemplationDependencies {
  apiClient: {
    post: (url: string, data?: unknown) => Promise<unknown>;
    delete: (url: string) => Promise<unknown>;
  };
  enqueueSnackbar: (
    message: string,
    options?: { variant: string; autoHideDuration?: number }
  ) => void;
  refetch: () => Promise<unknown>;
}

/**
 * Dados do participante para contemplação
 */
export interface ContemplationParticipant {
  id: string | number;
  name: string;
}

/**
 * Resultado da operação de contemplação
 */
export interface ContemplationResult {
  success: boolean;
  error?: string;
}

/**
 * Contempla um participante em um retiro
 *
 * @param retreatId - ID do retiro
 * @param participant - Dados do participante a ser contemplado
 * @param deps - Dependências injetadas (apiClient, enqueueSnackbar, refetch)
 * @returns Promise<ContemplationResult> - Resultado da operação
 */
export async function handleContemplate(
  retreatId: string,
  participant: ContemplationParticipant,
  deps: ContemplationDependencies
): Promise<ContemplationResult> {
  const { apiClient, enqueueSnackbar, refetch } = deps;

  try {
    await apiClient.post(`/retreats/${retreatId}/selections/${participant.id}`);

    enqueueSnackbar(
      `Participante ${participant.name} contemplado com sucesso!`,
      {
        variant: "success",
      }
    );

    // Refetch data to update the list
    await refetch();

    return { success: true };
  } catch (error) {
    console.error("Erro ao contemplar participante:", error);

    const message = axios.isAxiosError(error)
      ? ((error.response?.data as { error?: string })?.error ?? error.message)
      : "Erro ao contemplar participante";

    enqueueSnackbar(message, {
      variant: "error",
      autoHideDuration: 5000,
    });

    return { success: false, error: message };
  }
}

/**
 * Remove a contemplação de um participante em um retiro
 *
 * @param retreatId - ID do retiro
 * @param participant - Dados do participante a ter contemplação removida
 * @param deps - Dependências injetadas (apiClient, enqueueSnackbar, refetch)
 * @returns Promise<ContemplationResult> - Resultado da operação
 */
export async function handleRemoveContemplation(
  retreatId: string,
  participant: ContemplationParticipant,
  deps: ContemplationDependencies
): Promise<ContemplationResult> {
  const { apiClient, enqueueSnackbar, refetch } = deps;

  try {
    await apiClient.delete(
      `/retreats/${retreatId}/selections/${participant.id}`
    );

    enqueueSnackbar(
      `Contemplação de ${participant.name} removida com sucesso!`,
      {
        variant: "success",
      }
    );

    // Refetch data to update the list
    await refetch();

    return { success: true };
  } catch (error) {
    console.error("Erro ao remover contemplação:", error);

    const message = axios.isAxiosError(error)
      ? ((error.response?.data as { error?: string })?.error ?? error.message)
      : "Erro ao remover contemplação";

    enqueueSnackbar(message, {
      variant: "error",
      autoHideDuration: 5000,
    });

    return { success: false, error: message };
  }
}
