/**
 * Contemplation Actions - Testes Unitários
 *
 * Testes das funções reais handleContemplate e handleRemoveContemplation
 * importadas do módulo contemplationActions.ts.
 *
 * Apenas as dependências são mockadas:
 * - apiClient (post, delete)
 * - enqueueSnackbar
 * - refetch
 */

import "@testing-library/jest-dom";
import {
  handleContemplate,
  handleRemoveContemplation,
  ContemplationDependencies,
  ContemplationParticipant,
} from "@/src/components/retreats/tabs/RetreatContemplation/contemplationActions";

// Mock do axios para isAxiosError
jest.mock("axios", () => ({
  isAxiosError: (error: unknown) =>
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as { isAxiosError: boolean }).isAxiosError === true,
}));

describe("contemplationActions - Testes Unitários", () => {
  // Mocks das dependências
  let mockApiClient: {
    post: jest.Mock;
    delete: jest.Mock;
  };
  let mockEnqueueSnackbar: jest.Mock;
  let mockRefetch: jest.Mock;
  let deps: ContemplationDependencies;

  // Dados de teste
  const retreatId = "retreat-123";

  const mockParticipant: ContemplationParticipant = {
    id: "1",
    name: "João Silva",
  };

  const mockContemplatedParticipant: ContemplationParticipant = {
    id: "2",
    name: "Maria Santos",
  };

  beforeEach(() => {
    // Cria novos mocks para cada teste
    mockApiClient = {
      post: jest.fn().mockResolvedValue({ data: { success: true } }),
      delete: jest.fn().mockResolvedValue({ data: { success: true } }),
    };
    mockEnqueueSnackbar = jest.fn();
    mockRefetch = jest.fn().mockResolvedValue({ data: { rows: [] } });

    deps = {
      apiClient: mockApiClient,
      enqueueSnackbar: mockEnqueueSnackbar,
      refetch: mockRefetch,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("handleContemplate", () => {
    it("deve chamar a API corretamente ao contemplar um participante", async () => {
      await handleContemplate(retreatId, mockParticipant, deps);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/retreats/${retreatId}/selections/${mockParticipant.id}`
      );
      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
    });

    it("deve exibir notificação de sucesso ao contemplar participante", async () => {
      await handleContemplate(retreatId, mockParticipant, deps);

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        `Participante ${mockParticipant.name} contemplado com sucesso!`,
        { variant: "success" }
      );
    });

    it("deve fazer refetch dos dados após contemplar com sucesso", async () => {
      await handleContemplate(retreatId, mockParticipant, deps);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it("deve retornar success: true quando contemplação é bem sucedida", async () => {
      const result = await handleContemplate(retreatId, mockParticipant, deps);

      expect(result).toEqual({ success: true });
    });

    it("deve exibir notificação de erro quando a contemplação falha", async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error("Network error"));

      await handleContemplate(retreatId, mockParticipant, deps);

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        "Erro ao contemplar participante",
        expect.objectContaining({ variant: "error" })
      );
    });

    it("deve extrair mensagem de erro do Axios quando disponível", async () => {
      const axiosError = {
        response: { data: { error: "Participante já contemplado" } },
        message: "Request failed",
        isAxiosError: true,
      };
      mockApiClient.post.mockRejectedValueOnce(axiosError);

      await handleContemplate(retreatId, mockParticipant, deps);

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        "Participante já contemplado",
        expect.objectContaining({ variant: "error" })
      );
    });

    it("deve retornar success: false e a mensagem de erro quando falha", async () => {
      const axiosError = {
        response: { data: { error: "Limite de contemplados atingido" } },
        message: "Request failed",
        isAxiosError: true,
      };
      mockApiClient.post.mockRejectedValueOnce(axiosError);

      const result = await handleContemplate(retreatId, mockParticipant, deps);

      expect(result).toEqual({
        success: false,
        error: "Limite de contemplados atingido",
      });
    });

    it("não deve fazer refetch quando a contemplação falha", async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error("Network error"));

      await handleContemplate(retreatId, mockParticipant, deps);

      expect(mockRefetch).not.toHaveBeenCalled();
    });

    it("deve usar o ID do participante correto no endpoint", async () => {
      const participantWithNumericId: ContemplationParticipant = {
        id: 42,
        name: "Pedro Costa",
      };

      await handleContemplate(retreatId, participantWithNumericId, deps);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/retreats/retreat-123/selections/42"
      );
    });
  });

  describe("handleRemoveContemplation", () => {
    it("deve chamar a API corretamente ao remover contemplação", async () => {
      await handleRemoveContemplation(
        retreatId,
        mockContemplatedParticipant,
        deps
      );

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        `/retreats/${retreatId}/selections/${mockContemplatedParticipant.id}`
      );
      expect(mockApiClient.delete).toHaveBeenCalledTimes(1);
    });

    it("deve exibir notificação de sucesso ao remover contemplação", async () => {
      await handleRemoveContemplation(
        retreatId,
        mockContemplatedParticipant,
        deps
      );

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        `Contemplação de ${mockContemplatedParticipant.name} removida com sucesso!`,
        { variant: "success" }
      );
    });

    it("deve fazer refetch dos dados após remover contemplação com sucesso", async () => {
      await handleRemoveContemplation(
        retreatId,
        mockContemplatedParticipant,
        deps
      );

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it("deve retornar success: true quando remoção é bem sucedida", async () => {
      const result = await handleRemoveContemplation(
        retreatId,
        mockContemplatedParticipant,
        deps
      );

      expect(result).toEqual({ success: true });
    });

    it("deve exibir notificação de erro quando a remoção falha", async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error("Network error"));

      await handleRemoveContemplation(
        retreatId,
        mockContemplatedParticipant,
        deps
      );

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        "Erro ao remover contemplação",
        expect.objectContaining({ variant: "error" })
      );
    });

    it("deve extrair mensagem de erro do Axios quando disponível", async () => {
      const axiosError = {
        response: { data: { error: "Participante não está contemplado" } },
        message: "Request failed",
        isAxiosError: true,
      };
      mockApiClient.delete.mockRejectedValueOnce(axiosError);

      await handleRemoveContemplation(
        retreatId,
        mockContemplatedParticipant,
        deps
      );

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        "Participante não está contemplado",
        expect.objectContaining({ variant: "error" })
      );
    });

    it("deve retornar success: false e a mensagem de erro quando falha", async () => {
      const axiosError = {
        response: { data: { error: "Operação não permitida" } },
        message: "Request failed",
        isAxiosError: true,
      };
      mockApiClient.delete.mockRejectedValueOnce(axiosError);

      const result = await handleRemoveContemplation(
        retreatId,
        mockContemplatedParticipant,
        deps
      );

      expect(result).toEqual({
        success: false,
        error: "Operação não permitida",
      });
    });

    it("não deve fazer refetch quando a remoção falha", async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error("Network error"));

      await handleRemoveContemplation(
        retreatId,
        mockContemplatedParticipant,
        deps
      );

      expect(mockRefetch).not.toHaveBeenCalled();
    });

    it("deve usar o ID do participante correto no endpoint", async () => {
      const participantWithNumericId: ContemplationParticipant = {
        id: 99,
        name: "Ana Oliveira",
      };

      await handleRemoveContemplation(
        retreatId,
        participantWithNumericId,
        deps
      );

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        "/retreats/retreat-123/selections/99"
      );
    });
  });

  describe("Fluxo completo de contemplação", () => {
    it("deve permitir contemplar e depois remover contemplação do mesmo participante", async () => {
      const participant: ContemplationParticipant = {
        id: "participant-1",
        name: "Carlos Souza",
      };

      // Contemplar
      const contemplateResult = await handleContemplate(
        retreatId,
        participant,
        deps
      );
      expect(contemplateResult.success).toBe(true);
      expect(mockApiClient.post).toHaveBeenCalledTimes(1);

      // Remover contemplação
      const removeResult = await handleRemoveContemplation(
        retreatId,
        participant,
        deps
      );
      expect(removeResult.success).toBe(true);
      expect(mockApiClient.delete).toHaveBeenCalledTimes(1);

      // Verificar que refetch foi chamado 2 vezes (uma para cada operação)
      expect(mockRefetch).toHaveBeenCalledTimes(2);
    });

    it("deve contemplar múltiplos participantes em sequência", async () => {
      const participants: ContemplationParticipant[] = [
        { id: "1", name: "Participante 1" },
        { id: "2", name: "Participante 2" },
        { id: "3", name: "Participante 3" },
      ];

      for (const participant of participants) {
        await handleContemplate(retreatId, participant, deps);
      }

      expect(mockApiClient.post).toHaveBeenCalledTimes(3);
      expect(mockEnqueueSnackbar).toHaveBeenCalledTimes(3);
      expect(mockRefetch).toHaveBeenCalledTimes(3);

      // Verificar ordem das chamadas
      expect(mockApiClient.post).toHaveBeenNthCalledWith(
        1,
        "/retreats/retreat-123/selections/1"
      );
      expect(mockApiClient.post).toHaveBeenNthCalledWith(
        2,
        "/retreats/retreat-123/selections/2"
      );
      expect(mockApiClient.post).toHaveBeenNthCalledWith(
        3,
        "/retreats/retreat-123/selections/3"
      );
    });

    it("deve remover contemplação de múltiplos participantes em sequência", async () => {
      const participants: ContemplationParticipant[] = [
        { id: "10", name: "Contemplado 1" },
        { id: "20", name: "Contemplado 2" },
      ];

      for (const participant of participants) {
        await handleRemoveContemplation(retreatId, participant, deps);
      }

      expect(mockApiClient.delete).toHaveBeenCalledTimes(2);
      expect(mockEnqueueSnackbar).toHaveBeenCalledTimes(2);
      expect(mockRefetch).toHaveBeenCalledTimes(2);
    });

    it("deve continuar processando mesmo se uma operação falhar", async () => {
      const participants: ContemplationParticipant[] = [
        { id: "1", name: "Participante 1" },
        { id: "2", name: "Participante 2" },
        { id: "3", name: "Participante 3" },
      ];

      // Segunda chamada falha
      mockApiClient.post
        .mockResolvedValueOnce({ data: { success: true } })
        .mockRejectedValueOnce(new Error("Erro na segunda"))
        .mockResolvedValueOnce({ data: { success: true } });

      const results = [];
      for (const participant of participants) {
        const result = await handleContemplate(retreatId, participant, deps);
        results.push(result);
      }

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(true);

      // API foi chamada 3 vezes
      expect(mockApiClient.post).toHaveBeenCalledTimes(3);

      // Refetch foi chamado apenas 2 vezes (para as operações bem sucedidas)
      expect(mockRefetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("Validação de parâmetros", () => {
    it("deve funcionar com retreatId em diferentes formatos", async () => {
      const retreatIds = ["abc-123", "retreat-uuid-456", "123"];

      for (const id of retreatIds) {
        mockApiClient.post.mockClear();
        await handleContemplate(id, mockParticipant, deps);
        expect(mockApiClient.post).toHaveBeenCalledWith(
          `/retreats/${id}/selections/${mockParticipant.id}`
        );
      }
    });

    it("deve funcionar com IDs de participante numéricos e strings", async () => {
      const participantWithStringId: ContemplationParticipant = {
        id: "abc-123",
        name: "String ID",
      };
      const participantWithNumericId: ContemplationParticipant = {
        id: 456,
        name: "Numeric ID",
      };

      await handleContemplate(retreatId, participantWithStringId, deps);
      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/retreats/retreat-123/selections/abc-123"
      );

      mockApiClient.post.mockClear();

      await handleContemplate(retreatId, participantWithNumericId, deps);
      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/retreats/retreat-123/selections/456"
      );
    });
  });
});
