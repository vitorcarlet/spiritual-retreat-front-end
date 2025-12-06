/**
 * ContemplatedTable Component - Testes de Integração
 *
 * Testes que renderizam o componente completo e verificam:
 * - Renderização da tabela de contemplados
 * - Ação de remover contemplação via botão na tabela
 * - Ação de enviar mensagem
 * - Estados de loading e erro
 * - Interações do usuário
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// Interface do participante
interface ContemplatedParticipant {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  region: string;
  status: string;
  photoUrl: string | null;
  activity: string;
  paymentStatus: string;
  participation: boolean;
}

// Dados mockados para a tabela
const mockContemplatedParticipants: ContemplatedParticipant[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@email.com",
    phone: "11999999999",
    cpf: "123.456.789-00",
    region: "São Paulo",
    status: "Selected",
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
    paymentStatus: "paid",
    participation: true,
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    email: "pedro@email.com",
    phone: "11777777777",
    cpf: "111.222.333-44",
    region: "Minas Gerais",
    status: "Confirmed",
    photoUrl: null,
    activity: "Voluntário",
    paymentStatus: "pending",
    participation: false,
  },
];

// Mock do notistack - usando função inline
const mockEnqueueSnackbar = jest.fn();
jest.mock("notistack", () => ({
  enqueueSnackbar: (...args: unknown[]) => mockEnqueueSnackbar(...args),
}));

// Mock do apiClient - definição inline na factory
jest.mock("@/src/lib/axiosClientInstance", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock do axios
jest.mock("axios", () => ({
  isAxiosError: (error: unknown) =>
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as { isAxiosError: boolean }).isAxiosError === true,
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
    status: "authenticated" as const,
  }),
}));

// Mock do next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/retreats/retreat-123/contemplations",
}));

// Mock do useUrlFilters
const mockUpdateFilters = jest.fn();
const mockResetFilters = jest.fn();
jest.mock("@/src/hooks/useUrlFilters", () => ({
  useUrlFilters: () => ({
    filters: { page: 1, pageLimit: 10, status: ["Selected"] },
    updateFilters: (...args: unknown[]) => mockUpdateFilters(...args),
    activeFiltersCount: 0,
    resetFilters: () => mockResetFilters(),
  }),
}));

// Mock do useModal
const mockModalOpen = jest.fn();
const mockModalClose = jest.fn();
jest.mock("@/src/hooks/useModal", () => ({
  useModal: () => ({
    open: (...args: unknown[]) => mockModalOpen(...args),
    close: () => mockModalClose(),
  }),
}));

// Mock do react-query
const mockRefetch = jest
  .fn()
  .mockResolvedValue({ data: { rows: mockContemplatedParticipants } });

jest.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: {
      rows: [
        {
          id: "1",
          name: "João Silva",
          email: "joao@email.com",
          phone: "11999999999",
          cpf: "123.456.789-00",
          region: "São Paulo",
          status: "Selected",
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
          paymentStatus: "paid",
          participation: true,
        },
        {
          id: "3",
          name: "Pedro Oliveira",
          email: "pedro@email.com",
          phone: "11777777777",
          cpf: "111.222.333-44",
          region: "Minas Gerais",
          status: "Confirmed",
          photoUrl: null,
          activity: "Voluntário",
          paymentStatus: "pending",
          participation: false,
        },
      ],
      total: 3,
      page: 1,
      pageLimit: 10,
    },
    isLoading: false,
    isFetching: false,
    refetch: () => mockRefetch(),
  }),
  QueryClient: jest.fn().mockImplementation(() => ({
    invalidateQueries: jest.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Mock dos componentes internos que não precisamos testar aqui
jest.mock("@/src/components/table/DataTable", () => ({
  DataTable: ({
    rows,
    actions,
    loading,
  }: {
    rows: ContemplatedParticipant[];
    columns: unknown[];
    actions?: Array<{
      icon: string;
      label: string;
      onClick: (row: ContemplatedParticipant) => void;
      color?: string;
    }>;
    loading?: boolean;
  }) => (
    <div data-testid="data-table">
      {loading && <div data-testid="table-loading">Carregando...</div>}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} data-testid={`row-${row.id}`}>
              <td>{row.id}</td>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>{row.status}</td>
              <td>
                {actions?.map((action) => (
                  <button
                    key={action.label}
                    data-testid={`action-${action.label.toLowerCase().replace(/\s/g, "-")}-${row.id}`}
                    onClick={() => action.onClick(row)}
                  >
                    {action.label}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
}));

jest.mock("@/src/components/filters/FilterButton", () => ({
  __esModule: true,
  default: ({
    onApplyFilters,
    onReset,
  }: {
    onApplyFilters: (f: unknown) => void;
    onReset: () => void;
  }) => (
    <div>
      <button
        data-testid="filter-button"
        onClick={() => onApplyFilters({ status: ["Selected"] })}
      >
        Filtros
      </button>
      <button data-testid="reset-filters" onClick={onReset}>
        Limpar
      </button>
    </div>
  ),
}));

jest.mock("@/src/components/filters/SearchField", () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
  }) => (
    <input
      data-testid="search-field"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

jest.mock(
  "@/src/components/retreats/tabs/RetreatContemplation/no-contemplated/ParticipantForm",
  () => ({
    __esModule: true,
    default: () => <div data-testid="participant-form">Participant Form</div>,
  })
);

jest.mock(
  "@/src/components/retreats/tabs/RetreatContemplation/contemplated/SendMessage",
  () => ({
    SendMessage: () => (
      <div data-testid="send-message">Send Message Component</div>
    ),
  })
);

jest.mock(
  "@/src/components/retreats/tabs/RetreatContemplation/contemplated/getFilters",
  () => ({
    getFilters: () => [],
  })
);

jest.mock("@/src/components/retreats/tabs/RetreatContemplation/shared", () => ({
  extractRegistrations: (data: unknown) => {
    if (data && typeof data === "object" && "items" in data) {
      return (data as { items: unknown[] }).items;
    }
    return [];
  },
  mapRegistrationToParticipant: (registration: ContemplatedParticipant) =>
    registration,
  getInitials: (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join(""),
  DEFAULT_FILTERS: { page: 1, pageLimit: 10, status: ["Selected"] },
}));

jest.mock("@/src/components/table/shared", () => ({
  keysToRemoveFromFilters: ["page", "pageLimit", "search"],
}));

// Import do componente e apiClient após os mocks
import ContemplatedTable from "@/src/components/retreats/tabs/RetreatContemplation/contemplated/index";
import apiClient from "@/src/lib/axiosClientInstance";

// Referência tipada para o mock do apiClient
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("ContemplatedTable - Testes de Integração", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.get.mockResolvedValue({
      data: { items: mockContemplatedParticipants },
    });
    mockApiClient.delete.mockResolvedValue({ data: { success: true } });
  });

  describe("Renderização", () => {
    it("deve renderizar a tabela de contemplados", async () => {
      render(<ContemplatedTable id="retreat-123" />);

      await waitFor(() => {
        expect(screen.getByTestId("data-table")).toBeInTheDocument();
      });
    });

    it("deve exibir os participantes contemplados na tabela", async () => {
      render(<ContemplatedTable id="retreat-123" />);

      await waitFor(() => {
        expect(screen.getByTestId("row-1")).toBeInTheDocument();
        expect(screen.getByTestId("row-2")).toBeInTheDocument();
        expect(screen.getByTestId("row-3")).toBeInTheDocument();
      });

      // Verifica os nomes dos participantes
      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.getByText("Maria Santos")).toBeInTheDocument();
      expect(screen.getByText("Pedro Oliveira")).toBeInTheDocument();
    });

    it("deve exibir o botão de atualizar dados", async () => {
      render(<ContemplatedTable id="retreat-123" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /atualizar dados/i })
        ).toBeInTheDocument();
      });
    });

    it("deve exibir o botão de enviar mensagens para todos", async () => {
      render(<ContemplatedTable id="retreat-123" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /enviar mensagens para todos/i })
        ).toBeInTheDocument();
      });
    });

    it("deve exibir o campo de busca", async () => {
      render(<ContemplatedTable id="retreat-123" />);

      await waitFor(() => {
        expect(screen.getByTestId("search-field")).toBeInTheDocument();
      });
    });

    it("deve exibir o botão de filtros", async () => {
      render(<ContemplatedTable id="retreat-123" />);

      await waitFor(() => {
        expect(screen.getByTestId("filter-button")).toBeInTheDocument();
      });
    });
  });

  describe("Ações da tabela", () => {
    it("deve exibir botões de ação para cada participante", async () => {
      render(<ContemplatedTable id="retreat-123" />);

      await waitFor(() => {
        // Verifica botões de ação para o primeiro participante
        expect(screen.getByTestId("action-ver-mais-1")).toBeInTheDocument();
        expect(
          screen.getByTestId("action-enviar-mensagem-1")
        ).toBeInTheDocument();
        expect(
          screen.getByTestId("action-remover-contemplação-1")
        ).toBeInTheDocument();
      });
    });

    it("deve chamar handleRemoveContemplation ao clicar no botão de remover", async () => {
      const user = userEvent.setup();
      render(<ContemplatedTable id="retreat-123" />);

      await waitFor(() => {
        expect(
          screen.getByTestId("action-remover-contemplação-1")
        ).toBeInTheDocument();
      });

      // Clica no botão de remover contemplação
      await user.click(screen.getByTestId("action-remover-contemplação-1"));

      // Verifica se a API foi chamada
      await waitFor(() => {
        expect(mockApiClient.delete).toHaveBeenCalledWith(
          "/retreats/retreat-123/selections/1"
        );
      });
    });

    it("deve exibir notificação de sucesso ao remover contemplação", async () => {
      const user = userEvent.setup();
      render(<ContemplatedTable id="retreat-123" />);

      await waitFor(() => {
        expect(
          screen.getByTestId("action-remover-contemplação-1")
        ).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("action-remover-contemplação-1"));

      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
          "Contemplação de João Silva removida com sucesso!",
          { variant: "success" }
        );
      });
    });

    it("deve fazer refetch após remover contemplação com sucesso", async () => {
      const user = userEvent.setup();
      render(<ContemplatedTable id="retreat-123" />);

      await waitFor(() => {
        expect(
          screen.getByTestId("action-remover-contemplação-1")
        ).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("action-remover-contemplação-1"));

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    it("deve exibir notificação de erro quando remoção falha", async () => {
      mockApiClient.delete.mockRejectedValueOnce({
        response: { data: { error: "Erro ao remover" } },
        isAxiosError: true,
      });

      const user = userEvent.setup();
      render(<ContemplatedTable id="retreat-123" />);

      await waitFor(() => {
        expect(
          screen.getByTestId("action-remover-contemplação-1")
        ).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("action-remover-contemplação-1"));

      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
          expect.stringContaining("Erro"),
          expect.objectContaining({ variant: "error" })
        );
      });
    });

    it("deve abrir modal ao clicar em Ver Mais", async () => {
      const user = userEvent.setup();
      render(<ContemplatedTable id="retreat-123" />);

      await waitFor(() => {
        expect(screen.getByTestId("action-ver-mais-1")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("action-ver-mais-1"));

      await waitFor(() => {
        expect(mockModalOpen).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Participant Details",
            size: "md",
          })
        );
      });
    });

    it("deve abrir modal ao clicar em Enviar Mensagem", async () => {
      const user = userEvent.setup();
      render(<ContemplatedTable id="retreat-123" />);

      await waitFor(() => {
        expect(
          screen.getByTestId("action-enviar-mensagem-1")
        ).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("action-enviar-mensagem-1"));

      await waitFor(() => {
        expect(mockModalOpen).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Enviar Mensagem",
            size: "xl",
          })
        );
      });
    });
  });

  describe("Botões de ação geral", () => {
    it("deve chamar refetch ao clicar em Atualizar Dados", async () => {
      const user = userEvent.setup();
      render(<ContemplatedTable id="retreat-123" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /atualizar dados/i })
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole("button", { name: /atualizar dados/i })
      );

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    it("deve abrir modal de mensagem para todos ao clicar no botão", async () => {
      const user = userEvent.setup();
      render(<ContemplatedTable id="retreat-123" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /enviar mensagens para todos/i })
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole("button", { name: /enviar mensagens para todos/i })
      );

      await waitFor(() => {
        expect(mockModalOpen).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Enviar Mensagem",
            size: "xl",
          })
        );
      });
    });
  });

  describe("Busca e Filtros", () => {
    it("deve atualizar filtros ao digitar na busca", async () => {
      const user = userEvent.setup();
      render(<ContemplatedTable id="retreat-123" />);

      await waitFor(() => {
        expect(screen.getByTestId("search-field")).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId("search-field");
      await user.type(searchInput, "João");

      await waitFor(() => {
        expect(mockUpdateFilters).toHaveBeenCalled();
      });
    });

    it("deve aplicar filtros ao clicar no botão de filtros", async () => {
      const user = userEvent.setup();
      render(<ContemplatedTable id="retreat-123" />);

      await waitFor(() => {
        expect(screen.getByTestId("filter-button")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("filter-button"));

      await waitFor(() => {
        expect(mockUpdateFilters).toHaveBeenCalled();
      });
    });

    it("deve resetar filtros ao clicar em limpar", async () => {
      const user = userEvent.setup();
      render(<ContemplatedTable id="retreat-123" />);

      await waitFor(() => {
        expect(screen.getByTestId("reset-filters")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("reset-filters"));

      await waitFor(() => {
        expect(mockResetFilters).toHaveBeenCalled();
      });
    });
  });
});

describe("ContemplatedTable - Integração completa", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.delete.mockResolvedValue({ data: { success: true } });
  });

  it("deve permitir remover múltiplas contemplações em sequência", async () => {
    const user = userEvent.setup();
    render(<ContemplatedTable id="retreat-123" />);

    await waitFor(() => {
      expect(
        screen.getByTestId("action-remover-contemplação-1")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("action-remover-contemplação-2")
      ).toBeInTheDocument();
    });

    // Remove primeiro participante
    await user.click(screen.getByTestId("action-remover-contemplação-1"));
    await waitFor(() => {
      expect(mockApiClient.delete).toHaveBeenCalledWith(
        "/retreats/retreat-123/selections/1"
      );
    });

    // Remove segundo participante
    await user.click(screen.getByTestId("action-remover-contemplação-2"));
    await waitFor(() => {
      expect(mockApiClient.delete).toHaveBeenCalledWith(
        "/retreats/retreat-123/selections/2"
      );
    });

    expect(mockApiClient.delete).toHaveBeenCalledTimes(2);
  });

  it("fluxo completo: buscar, visualizar e remover contemplação", async () => {
    const user = userEvent.setup();
    render(<ContemplatedTable id="retreat-123" />);

    // 1. Busca por participante
    await waitFor(() => {
      expect(screen.getByTestId("search-field")).toBeInTheDocument();
    });
    await user.type(screen.getByTestId("search-field"), "João");

    // 2. Visualiza detalhes
    await user.click(screen.getByTestId("action-ver-mais-1"));
    await waitFor(() => {
      expect(mockModalOpen).toHaveBeenCalled();
    });

    // 3. Remove contemplação
    await user.click(screen.getByTestId("action-remover-contemplação-1"));
    await waitFor(() => {
      expect(mockApiClient.delete).toHaveBeenCalled();
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining("sucesso"),
        expect.objectContaining({ variant: "success" })
      );
    });
  });
});
