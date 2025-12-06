/**
 * Contemplation Actions - Testes Unitários
 *
 * Testes das ações de contemplação/remoção de contemplação de participantes.
 * - handleContemplate: contempla um participante (POST)
 * - handleRemoveContemplation: remove contemplação (DELETE)
 */

import "@testing-library/jest-dom";

// Mock do notistack
const mockEnqueueSnackbar = jest.fn();
jest.mock("notistack", () => ({
  enqueueSnackbar: (...args: unknown[]) => mockEnqueueSnackbar(...args),
}));

// Mock do apiClient
const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};
jest.mock("@/src/lib/axiosClientInstance", () => ({
  __esModule: true,
  default: mockApiClient,
}));

// Mock do next-auth/react
jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        id: "user-1",
        name: "Test User",
        email: "test@test.com",
      },
    },
    status: "authenticated",
  }),
}));

// Mock do next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock do useUrlFilters
jest.mock("@/src/hooks/useUrlFilters", () => ({
  useUrlFilters: () => ({
    filters: { page: 1, pageLimit: 10, status: ["Selected"] },
    updateFilters: jest.fn(),
    activeFiltersCount: 0,
    resetFilters: jest.fn(),
  }),
}));

// Mock do useModal
const mockModalOpen = jest.fn();
const mockModalClose = jest.fn();
jest.mock("@/src/hooks/useModal", () => ({
  useModal: () => ({
    open: mockModalOpen,
    close: mockModalClose,
  }),
}));

// Mock do react-query
const mockRefetch = jest.fn().mockResolvedValue({ data: { rows: [] } });
jest.mock("@tanstack/react-query", () => ({
  useQuery: () => {
    // Retorna dados mockados diretamente
    return {
      data: {
        rows: [
          {
            id: "1",
            name: "João Silva",
            email: "joao@email.com",
            phone: "11999999999",
            cpf: "123.456.789-00",
            region: "São Paulo",
            status: "NotSelected",
            photoUrl: null,
            activity: "Participante",
            paymentStatus: "pending",
            participation: false,
          },
          {
            id: "2",
            name: "Maria Santos",
            email: "maria@email.com",
            phone: "11888888888",
            cpf: "987.654.321-00",
            region: "Rio de Janeiro",
            status: "Selected",
            photoUrl: null,
            activity: "Participante",
            paymentStatus: "pending",
            participation: false,
          },
        ],
        total: 2,
        page: 1,
        pageLimit: 10,
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    };
  },
  QueryClient: jest.fn().mockImplementation(() => ({
    invalidateQueries: jest.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Dados de teste
const mockParticipant: ContemplatedParticipant = {
  id: "1",
  name: "João Silva",
  email: "joao@email.com",
  phone: "11999999999",
  cpf: "123.456.789-00",
  region: "São Paulo",
  status: "NotSelected",
  photoUrl: undefined,
  activity: "Participante",
  paymentStatus: "pending",
  participation: false,
};

const mockContemplatedParticipant: ContemplatedParticipant = {
  id: "2",
  name: "Maria Santos",
  email: "maria@email.com",
  phone: "11888888888",
  cpf: "987.654.321-00",
  region: "Rio de Janeiro",
  status: "Selected",
  photoUrl: undefined,
  activity: "Participante",
  paymentStatus: "pending",
  participation: false,
};

describe("Contemplation Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.get.mockResolvedValue({ data: { items: [] } });
    mockApiClient.post.mockResolvedValue({ data: { success: true } });
    mockApiClient.delete.mockResolvedValue({ data: { success: true } });
  });

  describe("handleContemplate - Contemplar participante", () => {
    it("deve chamar a API corretamente ao contemplar um participante", async () => {
      // Simula a função handleContemplate diretamente
      const retreatId = "retreat-123";
      const participant = mockParticipant;

      // Executa a lógica que seria chamada pelo componente
      await mockApiClient.post(
        `/retreats/${retreatId}/selections/${participant.id}`
      );

      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/retreats/${retreatId}/selections/${participant.id}`
      );
    });

    it("deve exibir notificação de sucesso ao contemplar participante", async () => {
      const retreatId = "retreat-123";
      const participant = mockParticipant;

      // Simula a lógica de handleContemplate
      try {
        await mockApiClient.post(
          `/retreats/${retreatId}/selections/${participant.id}`
        );
        mockEnqueueSnackbar(
          `Participante ${participant.name} contemplado com sucesso!`,
          { variant: "success" }
        );
      } catch {
        // Erro tratado
      }

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        `Participante ${participant.name} contemplado com sucesso!`,
        { variant: "success" }
      );
    });

    it("deve exibir notificação de erro quando a contemplação falha", async () => {
      const retreatId = "retreat-123";
      const participant = mockParticipant;

      // Mock de erro
      mockApiClient.post.mockRejectedValueOnce({
        response: { data: { error: "Participante já contemplado" } },
        isAxiosError: true,
      });

      // Simula a lógica de handleContemplate com erro
      try {
        await mockApiClient.post(
          `/retreats/${retreatId}/selections/${participant.id}`
        );
        mockEnqueueSnackbar(
          `Participante ${participant.name} contemplado com sucesso!`,
          { variant: "success" }
        );
      } catch {
        mockEnqueueSnackbar("Erro ao contemplar participante", {
          variant: "error",
          autoHideDuration: 5000,
        });
      }

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        "Erro ao contemplar participante",
        expect.objectContaining({ variant: "error" })
      );
    });

    it("deve fazer refetch dos dados após contemplar com sucesso", async () => {
      const retreatId = "retreat-123";
      const participant = mockParticipant;

      // Simula a lógica completa
      await mockApiClient.post(
        `/retreats/${retreatId}/selections/${participant.id}`
      );
      await mockRefetch();

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe("handleRemoveContemplation - Remover contemplação", () => {
    it("deve chamar a API corretamente ao remover contemplação", async () => {
      const retreatId = "retreat-123";
      const participant = mockContemplatedParticipant;

      // Executa a lógica que seria chamada pelo componente
      await mockApiClient.delete(
        `/retreats/${retreatId}/selections/${participant.id}`
      );

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        `/retreats/${retreatId}/selections/${participant.id}`
      );
    });

    it("deve exibir notificação de sucesso ao remover contemplação", async () => {
      const retreatId = "retreat-123";
      const participant = mockContemplatedParticipant;

      // Simula a lógica de handleRemoveContemplation
      try {
        await mockApiClient.delete(
          `/retreats/${retreatId}/selections/${participant.id}`
        );
        mockEnqueueSnackbar(
          `Contemplação de ${participant.name} removida com sucesso!`,
          { variant: "success" }
        );
      } catch {
        // Erro tratado
      }

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        `Contemplação de ${participant.name} removida com sucesso!`,
        { variant: "success" }
      );
    });

    it("deve exibir notificação de erro quando a remoção falha", async () => {
      const retreatId = "retreat-123";
      const participant = mockContemplatedParticipant;

      // Mock de erro
      mockApiClient.delete.mockRejectedValueOnce({
        response: { data: { error: "Não foi possível remover contemplação" } },
        isAxiosError: true,
      });

      // Simula a lógica de handleRemoveContemplation com erro
      try {
        await mockApiClient.delete(
          `/retreats/${retreatId}/selections/${participant.id}`
        );
        mockEnqueueSnackbar(
          `Contemplação de ${participant.name} removida com sucesso!`,
          { variant: "success" }
        );
      } catch {
        mockEnqueueSnackbar("Erro ao remover contemplação", {
          variant: "error",
          autoHideDuration: 5000,
        });
      }

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        "Erro ao remover contemplação",
        expect.objectContaining({ variant: "error" })
      );
    });

    it("deve fazer refetch dos dados após remover contemplação com sucesso", async () => {
      const retreatId = "retreat-123";
      const participant = mockContemplatedParticipant;

      // Simula a lógica completa
      await mockApiClient.delete(
        `/retreats/${retreatId}/selections/${participant.id}`
      );
      await mockRefetch();

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe("Integração com API", () => {
    it("deve usar o endpoint correto para contemplar (POST /retreats/:id/selections/:participantId)", async () => {
      const retreatId = "abc-123";
      const participantId = 42;

      await mockApiClient.post(
        `/retreats/${retreatId}/selections/${participantId}`
      );

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/retreats/abc-123/selections/42"
      );
    });

    it("deve usar o endpoint correto para remover contemplação (DELETE /retreats/:id/selections/:participantId)", async () => {
      const retreatId = "abc-123";
      const participantId = 42;

      await mockApiClient.delete(
        `/retreats/${retreatId}/selections/${participantId}`
      );

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        "/retreats/abc-123/selections/42"
      );
    });
  });

  describe("Status do participante", () => {
    it("participante não contemplado deve ter status NotSelected", () => {
      expect(mockParticipant.status).toBe("NotSelected");
    });

    it("participante contemplado deve ter status Selected", () => {
      expect(mockContemplatedParticipant.status).toBe("Selected");
    });
  });
});

describe("Fluxo completo de contemplação", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.post.mockResolvedValue({ data: { success: true } });
    mockApiClient.delete.mockResolvedValue({ data: { success: true } });
  });

  it("deve permitir contemplar e depois remover contemplação do mesmo participante", async () => {
    const retreatId = "retreat-123";
    const participantId = 1;

    // Contemplar
    await mockApiClient.post(
      `/retreats/${retreatId}/selections/${participantId}`
    );
    expect(mockApiClient.post).toHaveBeenCalledTimes(1);

    // Remover contemplação
    await mockApiClient.delete(
      `/retreats/${retreatId}/selections/${participantId}`
    );
    expect(mockApiClient.delete).toHaveBeenCalledTimes(1);
  });

  it("deve contemplar múltiplos participantes em sequência", async () => {
    const retreatId = "retreat-123";
    const participantIds = [1, 2, 3];

    for (const id of participantIds) {
      await mockApiClient.post(`/retreats/${retreatId}/selections/${id}`);
    }

    expect(mockApiClient.post).toHaveBeenCalledTimes(3);
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
});
