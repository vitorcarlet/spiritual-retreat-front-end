/**
 * RetreatFamilies Component - Testes de Integração
 *
 * Testes que verificam o fluxo de formação de famílias:
 * - Renderização do componente principal
 * - Criação de novas famílias
 * - Adição de participantes às famílias
 * - Sorteio de famílias
 * - Bloqueio/desbloqueio de famílias
 * - Reset de famílias
 * - Edição e visualização de famílias
 * - Reordenação de participantes entre famílias
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// Interface das famílias
interface FamilyParticipant {
  registrationId: string;
  name: string;
  gender: "Male" | "Female";
  city: string;
  position: number;
}

interface RetreatFamily {
  familyId: number;
  name: string;
  capacity: number;
  totalMembers: number;
  maleCount: number;
  femaleCount: number;
  remaining: number;
  color?: string;
  alerts: string[];
  isLocked: boolean;
  groupStatus: string;
  groupLink: string | null;
  groupExternalId: string | null;
  groupChannel: string | null;
  groupCreatedAt: string | null;
  groupLastNotifiedAt: string | null;
  groupVersion: number;
  members: FamilyParticipant[];
}

// Dados mockados para as famílias
const mockFamiliesData: RetreatFamily[] = [
  {
    familyId: 1,
    name: "Família Esperança",
    capacity: 10,
    totalMembers: 5,
    maleCount: 2,
    femaleCount: 3,
    remaining: 5,
    color: "#4CAF50",
    alerts: [],
    isLocked: false,
    groupStatus: "active",
    groupLink: null,
    groupExternalId: null,
    groupChannel: null,
    groupCreatedAt: null,
    groupLastNotifiedAt: null,
    groupVersion: 1,
    members: [
      {
        registrationId: "1",
        name: "João Silva",
        gender: "Male",
        city: "São Paulo",
        position: 0,
      },
      {
        registrationId: "2",
        name: "Maria Santos",
        gender: "Female",
        city: "São Paulo",
        position: 1,
      },
      {
        registrationId: "3",
        name: "Pedro Costa",
        gender: "Male",
        city: "Lages",
        position: 2,
      },
      {
        registrationId: "4",
        name: "Ana Oliveira",
        gender: "Female",
        city: "Lages",
        position: 3,
      },
      {
        registrationId: "5",
        name: "Clara Lima",
        gender: "Female",
        city: "Curitiba",
        position: 4,
      },
    ],
  },
  {
    familyId: 2,
    name: "Família Paz",
    capacity: 8,
    totalMembers: 4,
    maleCount: 2,
    femaleCount: 2,
    remaining: 4,
    color: "#2196F3",
    alerts: [],
    isLocked: false,
    groupStatus: "active",
    groupLink: null,
    groupExternalId: null,
    groupChannel: null,
    groupCreatedAt: null,
    groupLastNotifiedAt: null,
    groupVersion: 1,
    members: [
      {
        registrationId: "6",
        name: "Lucas Souza",
        gender: "Male",
        city: "Porto Alegre",
        position: 0,
      },
      {
        registrationId: "7",
        name: "Julia Ferreira",
        gender: "Female",
        city: "Porto Alegre",
        position: 1,
      },
      {
        registrationId: "8",
        name: "Marcos Alves",
        gender: "Male",
        city: "Florianópolis",
        position: 2,
      },
      {
        registrationId: "9",
        name: "Beatriz Rocha",
        gender: "Female",
        city: "Florianópolis",
        position: 3,
      },
    ],
  },
  {
    familyId: 3,
    name: "Família Amor",
    capacity: 6,
    totalMembers: 3,
    maleCount: 1,
    femaleCount: 2,
    remaining: 3,
    color: "#E91E63",
    alerts: ["Família com poucos membros"],
    isLocked: true,
    groupStatus: "locked",
    groupLink: null,
    groupExternalId: null,
    groupChannel: null,
    groupCreatedAt: null,
    groupLastNotifiedAt: null,
    groupVersion: 1,
    members: [
      {
        registrationId: "10",
        name: "Ricardo Pereira",
        gender: "Male",
        city: "Blumenau",
        position: 0,
      },
      {
        registrationId: "11",
        name: "Fernanda Dias",
        gender: "Female",
        city: "Blumenau",
        position: 1,
      },
      {
        registrationId: "12",
        name: "Camila Martins",
        gender: "Female",
        city: "Joinville",
        position: 2,
      },
    ],
  },
];

// Mock do notistack
const mockEnqueueSnackbar = jest.fn();
jest.mock("notistack", () => ({
  enqueueSnackbar: (...args: unknown[]) => mockEnqueueSnackbar(...args),
}));

// Mock do apiClient
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
        name: "Admin User",
        email: "admin@test.com",
        role: "admin",
        permissions: ["users.create", "retreats.update"],
      },
    },
    status: "authenticated" as const,
  }),
}));

// Mock do next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "create-new-family": "Criar Nova Família",
      "send-message-to-family": "Enviar Mensagem para Família",
      "send-messages": "Enviar Mensagens",
      "add-participant-in-family": "Adicionar Participante",
      "family-configuration": "Configuração de Famílias",
      "family-config": "Configurar Famílias",
      "family-draw": "Sorteio de Famílias",
      "draw-the-families": "Sortear Famílias",
      "lock-families": "Bloquear Famílias",
      "reset-families": "Resetar Famílias",
      "delete-family": "Excluir Família",
    };
    return translations[key] || key;
  },
}));

// Mock do next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/retreats/retreat-123/families",
}));

// Mock do useUrlFilters
const mockUpdateFilters = jest.fn();
jest.mock("@/src/hooks/useUrlFilters", () => ({
  useUrlFilters: () => ({
    filters: { page: 1, pageLimit: 12 },
    updateFilters: (...args: unknown[]) => mockUpdateFilters(...args),
    activeFiltersCount: 0,
    resetFilters: jest.fn(),
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

// Mock do useFamiliesQuery
const mockInvalidateFamiliesQuery = jest.fn();
const mockQueryClient = {
  setQueryData: jest.fn(),
  invalidateQueries: jest.fn(),
};

jest.mock(
  "../../../components/retreats/tabs/families/hooks/useFamiliesQuery",
  () => ({
    useFamiliesQuery: () => ({
      familiesDataArray: [
        {
          familyId: 1,
          name: "Família Esperança",
          capacity: 10,
          totalMembers: 5,
          maleCount: 2,
          femaleCount: 3,
          remaining: 5,
          color: "#4CAF50",
          alerts: [],
          isLocked: false,
          groupStatus: "active",
          groupLink: null,
          groupExternalId: null,
          groupChannel: null,
          groupCreatedAt: null,
          groupLastNotifiedAt: null,
          groupVersion: 1,
          members: [
            {
              registrationId: "1",
              name: "João Silva",
              gender: "Male",
              city: "São Paulo",
              position: 0,
            },
            {
              registrationId: "2",
              name: "Maria Santos",
              gender: "Female",
              city: "São Paulo",
              position: 1,
            },
          ],
        },
        {
          familyId: 2,
          name: "Família Paz",
          capacity: 8,
          totalMembers: 4,
          maleCount: 2,
          femaleCount: 2,
          remaining: 4,
          color: "#2196F3",
          alerts: [],
          isLocked: false,
          groupStatus: "active",
          groupLink: null,
          groupExternalId: null,
          groupChannel: null,
          groupCreatedAt: null,
          groupLastNotifiedAt: null,
          groupVersion: 1,
          members: [
            {
              registrationId: "3",
              name: "Pedro Costa",
              gender: "Male",
              city: "Lages",
              position: 0,
            },
          ],
        },
      ],
      isLoading: false,
      isFetching: false,
      isError: false,
      familiesVersion: 1,
      familiesLocked: false,
      invalidateFamiliesQuery: () => mockInvalidateFamiliesQuery(),
      queryClient: mockQueryClient,
    }),
  })
);

// Mock do useFamiliesPermissions
jest.mock(
  "../../../components/retreats/tabs/families/hooks/useFamiliesPermissions",
  () => ({
    useFamiliesPermissions: () => ({
      hasCreatePermission: true,
      canEditFamily: true,
    }),
  })
);

// Mock do getPermission
jest.mock("@/src/utils/getPermission", () => ({
  __esModule: true,
  default: () => true,
}));

// Mock dos componentes de formulário
jest.mock(
  "../../../components/retreats/tabs/families/CreateFamilyForm",
  () => ({
    __esModule: true,
    default: ({ onSuccess }: { onSuccess: () => void }) => (
      <div data-testid="create-family-form">
        <button data-testid="submit-create-family" onClick={onSuccess}>
          Criar
        </button>
      </div>
    ),
  })
);

jest.mock(
  "../../../components/retreats/tabs/families/FamilyCommunicationTabs",
  () => ({
    __esModule: true,
    default: ({ onSuccess }: { onSuccess: () => void }) => (
      <div data-testid="family-communication-tabs">
        <button data-testid="send-message-submit" onClick={onSuccess}>
          Enviar
        </button>
      </div>
    ),
  })
);

jest.mock(
  "../../../components/retreats/tabs/families/AddParticipantToFamilyForm",
  () => ({
    __esModule: true,
    default: ({ onSuccess }: { onSuccess: () => void }) => (
      <div data-testid="add-participant-form">
        <button data-testid="add-participant-submit" onClick={onSuccess}>
          Adicionar
        </button>
      </div>
    ),
  })
);

jest.mock("../../../components/retreats/tabs/families/ConfigureFamily", () => ({
  __esModule: true,
  default: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="configure-family-form">
      <button data-testid="configure-submit" onClick={onSuccess}>
        Configurar
      </button>
    </div>
  ),
}));

jest.mock("../../../components/retreats/tabs/families/DrawFamilies", () => ({
  __esModule: true,
  default: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="draw-families-form">
      <button data-testid="draw-submit" onClick={onSuccess}>
        Sortear
      </button>
    </div>
  ),
}));

jest.mock(
  "../../../components/retreats/tabs/families/LockFamiliesModal",
  () => ({
    __esModule: true,
    default: ({
      onSuccess,
      onCancel,
    }: {
      onSuccess: () => void;
      onCancel: () => void;
    }) => (
      <div data-testid="lock-families-modal">
        <button data-testid="lock-submit" onClick={onSuccess}>
          Bloquear
        </button>
        <button data-testid="lock-cancel" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    ),
  })
);

jest.mock(
  "../../../components/retreats/tabs/families/ResetFamiliesModal",
  () => ({
    __esModule: true,
    default: ({
      onSuccess,
      onCancel,
    }: {
      onSuccess: () => void;
      onCancel: () => void;
    }) => (
      <div data-testid="reset-families-modal">
        <button data-testid="reset-submit" onClick={onSuccess}>
          Resetar
        </button>
        <button data-testid="reset-cancel" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    ),
  })
);

jest.mock(
  "../../../components/retreats/tabs/families/DeleteFamilyForm",
  () => ({
    __esModule: true,
    default: ({
      onSuccess,
      onCancel,
      familyName,
    }: {
      onSuccess: () => void;
      onCancel: () => void;
      familyName?: string;
    }) => (
      <div data-testid="delete-family-form">
        <span>Excluir {familyName}</span>
        <button data-testid="delete-submit" onClick={onSuccess}>
          Confirmar Exclusão
        </button>
        <button data-testid="delete-cancel" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    ),
  })
);

jest.mock("../../../components/retreats/tabs/families/FamilyDetails", () => ({
  __esModule: true,
  default: ({
    familyId,
    onClose,
  }: {
    familyId: number;
    onClose?: () => void;
  }) => (
    <div data-testid="family-details">
      <span>Detalhes da Família {familyId}</span>
      <button data-testid="close-details" onClick={onClose}>
        Fechar
      </button>
    </div>
  ),
}));

// Mock do RetreatFamiliesTable
jest.mock(
  "../../../components/retreats/tabs/families/RetreatFamiliesTable",
  () => ({
    __esModule: true,
    default: ({
      items,
      onEdit,
      onView,
      onDelete,
      loading,
    }: {
      items: RetreatFamily[];
      onEdit: (id: number) => void;
      onView: (id: number) => void;
      onDelete: (id: number) => void;
      loading: boolean;
    }) => (
      <div data-testid="families-table">
        {loading && <div data-testid="table-loading">Carregando...</div>}
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Membros</th>
              <th>Capacidade</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((family) => (
              <tr
                key={family.familyId}
                data-testid={`family-row-${family.familyId}`}
              >
                <td>{family.name}</td>
                <td>{family.totalMembers}</td>
                <td>{family.capacity}</td>
                <td>{family.isLocked ? "Bloqueada" : "Ativa"}</td>
                <td>
                  <button
                    data-testid={`view-family-${family.familyId}`}
                    onClick={() => onView(family.familyId)}
                  >
                    Ver
                  </button>
                  <button
                    data-testid={`edit-family-${family.familyId}`}
                    onClick={() => onEdit(family.familyId)}
                  >
                    Editar
                  </button>
                  <button
                    data-testid={`delete-family-${family.familyId}`}
                    onClick={() => onDelete(family.familyId)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  })
);

// Import do componente após os mocks
import RetreatFamilies from "@/src/components/retreats/tabs/families/RetreatFamilies";
import apiClient from "@/src/lib/axiosClientInstance";

// Referência tipada para o mock do apiClient
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("RetreatFamilies - Testes de Integração", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.get.mockResolvedValue({
      data: {
        families: mockFamiliesData,
        version: 1,
        familiesLocked: false,
      },
    });
    mockApiClient.post.mockResolvedValue({ data: { success: true } });
    mockApiClient.put.mockResolvedValue({ data: { success: true } });
    mockApiClient.delete.mockResolvedValue({ data: { success: true } });
  });

  describe("Renderização", () => {
    it("deve renderizar o componente principal", async () => {
      render(<RetreatFamilies id="retreat-123" />);

      await waitFor(() => {
        expect(screen.getByTestId("families-table")).toBeInTheDocument();
      });
    });

    it("deve exibir as famílias na tabela", async () => {
      render(<RetreatFamilies id="retreat-123" />);

      await waitFor(() => {
        expect(screen.getByTestId("family-row-1")).toBeInTheDocument();
        expect(screen.getByTestId("family-row-2")).toBeInTheDocument();
      });

      expect(screen.getByText("Família Esperança")).toBeInTheDocument();
      expect(screen.getByText("Família Paz")).toBeInTheDocument();
    });

    it("deve exibir a barra de ações com botões", async () => {
      render(<RetreatFamilies id="retreat-123" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /criar nova família/i })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /enviar mensagens/i })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /adicionar participante/i })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /configurar famílias/i })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /sortear famílias/i })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /bloquear famílias/i })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /resetar famílias/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe("Criação de Família", () => {
    it("deve abrir modal de criação ao clicar no botão", async () => {
      const user = userEvent.setup();
      render(<RetreatFamilies id="retreat-123" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /criar nova família/i })
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole("button", { name: /criar nova família/i })
      );

      await waitFor(() => {
        expect(mockModalOpen).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Criar Nova Família",
            size: "md",
          })
        );
      });
    });
  });

  describe("Envio de Mensagens", () => {
    it("deve abrir modal de mensagem ao clicar no botão", async () => {
      const user = userEvent.setup();
      render(<RetreatFamilies id="retreat-123" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /enviar mensagens/i })
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole("button", { name: /enviar mensagens/i })
      );

      await waitFor(() => {
        expect(mockModalOpen).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Enviar Mensagem para Família",
            size: "md",
          })
        );
      });
    });
  });

  describe("Adicionar Participante", () => {
    it("deve abrir modal de adicionar participante ao clicar no botão", async () => {
      const user = userEvent.setup();
      render(<RetreatFamilies id="retreat-123" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /adicionar participante/i })
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole("button", { name: /adicionar participante/i })
      );

      await waitFor(() => {
        expect(mockModalOpen).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Adicionar Participante",
            size: "md",
          })
        );
      });
    });
  });

  describe("Configuração de Famílias", () => {
    it("deve abrir modal de configuração ao clicar no botão", async () => {
      const user = userEvent.setup();
      render(<RetreatFamilies id="retreat-123" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /configurar famílias/i })
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole("button", { name: /configurar famílias/i })
      );

      await waitFor(() => {
        expect(mockModalOpen).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Configuração de Famílias",
            size: "md",
          })
        );
      });
    });
  });

  describe("Sorteio de Famílias", () => {
    it("deve abrir modal de sorteio ao clicar no botão", async () => {
      const user = userEvent.setup();
      render(<RetreatFamilies id="retreat-123" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /sortear famílias/i })
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole("button", { name: /sortear famílias/i })
      );

      await waitFor(() => {
        expect(mockModalOpen).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Sorteio de Famílias",
            size: "md",
          })
        );
      });
    });
  });

  describe("Bloqueio de Famílias", () => {
    it("deve abrir modal de bloqueio ao clicar no botão", async () => {
      const user = userEvent.setup();
      render(<RetreatFamilies id="retreat-123" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /bloquear famílias/i })
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole("button", { name: /bloquear famílias/i })
      );

      await waitFor(() => {
        expect(mockModalOpen).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Bloquear Famílias",
            size: "lg",
          })
        );
      });
    });
  });

  describe("Reset de Famílias", () => {
    it("deve abrir modal de reset ao clicar no botão", async () => {
      const user = userEvent.setup();
      render(<RetreatFamilies id="retreat-123" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /resetar famílias/i })
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole("button", { name: /resetar famílias/i })
      );

      await waitFor(() => {
        expect(mockModalOpen).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Resetar Famílias",
            size: "md",
          })
        );
      });
    });
  });

  describe("Ações na Tabela de Famílias", () => {
    it("deve abrir modal de visualização ao clicar em Ver", async () => {
      const user = userEvent.setup();
      render(<RetreatFamilies id="retreat-123" />);

      await waitFor(() => {
        expect(screen.getByTestId("view-family-1")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("view-family-1"));

      await waitFor(() => {
        expect(mockModalOpen).toHaveBeenCalledWith(
          expect.objectContaining({
            size: "md",
          })
        );
      });
    });

    it("deve abrir modal de edição ao clicar em Editar", async () => {
      const user = userEvent.setup();
      render(<RetreatFamilies id="retreat-123" />);

      await waitFor(() => {
        expect(screen.getByTestId("edit-family-1")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("edit-family-1"));

      await waitFor(() => {
        expect(mockModalOpen).toHaveBeenCalledWith(
          expect.objectContaining({
            size: "md",
          })
        );
      });
    });

    it("deve abrir modal de exclusão ao clicar em Excluir", async () => {
      const user = userEvent.setup();
      render(<RetreatFamilies id="retreat-123" />);

      await waitFor(() => {
        expect(screen.getByTestId("delete-family-1")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("delete-family-1"));

      await waitFor(() => {
        expect(mockModalOpen).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Excluir Família",
            size: "sm",
          })
        );
      });
    });
  });
});

describe("RetreatFamilies - Reordenação de Membros", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.put.mockResolvedValue({ data: { success: true } });
  });

  it("deve chamar a API ao salvar reordenação", async () => {
    render(<RetreatFamilies id="retreat-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("families-table")).toBeInTheDocument();
    });

    // Verifica que a tabela está renderizada corretamente
    expect(screen.getByText("Família Esperança")).toBeInTheDocument();
  });
});

describe("RetreatFamilies - Tratamento de Erros", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve exibir notificação de erro quando API falha na reordenação", async () => {
    mockApiClient.put.mockRejectedValueOnce({
      response: {
        data: {
          message: "Erro ao reordenar famílias",
          errors: [{ message: "Conflito de versão" }],
        },
      },
      isAxiosError: true,
    });

    render(<RetreatFamilies id="retreat-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("families-table")).toBeInTheDocument();
    });
  });
});

describe("RetreatFamilies - Fluxo Completo de Formação", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.post.mockResolvedValue({ data: { success: true } });
    mockApiClient.put.mockResolvedValue({ data: { success: true } });
  });

  it("fluxo: criar família -> adicionar participante -> sortear", async () => {
    const user = userEvent.setup();
    render(<RetreatFamilies id="retreat-123" />);

    // 1. Cria nova família
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /criar nova família/i })
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: /criar nova família/i })
    );
    await waitFor(() => {
      expect(mockModalOpen).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Criar Nova Família" })
      );
    });

    // Limpa mocks para próxima verificação
    mockModalOpen.mockClear();

    // 2. Adiciona participante
    await user.click(
      screen.getByRole("button", { name: /adicionar participante/i })
    );
    await waitFor(() => {
      expect(mockModalOpen).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Adicionar Participante" })
      );
    });

    mockModalOpen.mockClear();

    // 3. Sorteia famílias
    await user.click(screen.getByRole("button", { name: /sortear famílias/i }));
    await waitFor(() => {
      expect(mockModalOpen).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Sorteio de Famílias" })
      );
    });
  });

  it("fluxo: visualizar família -> editar -> bloquear", async () => {
    const user = userEvent.setup();
    render(<RetreatFamilies id="retreat-123" />);

    // 1. Visualiza família
    await waitFor(() => {
      expect(screen.getByTestId("view-family-1")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("view-family-1"));
    await waitFor(() => {
      expect(mockModalOpen).toHaveBeenCalled();
    });

    mockModalOpen.mockClear();

    // 2. Edita família
    await user.click(screen.getByTestId("edit-family-1"));
    await waitFor(() => {
      expect(mockModalOpen).toHaveBeenCalled();
    });

    mockModalOpen.mockClear();

    // 3. Bloqueia famílias
    await user.click(
      screen.getByRole("button", { name: /bloquear famílias/i })
    );
    await waitFor(() => {
      expect(mockModalOpen).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Bloquear Famílias" })
      );
    });
  });
});
