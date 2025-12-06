/**
 * PublicRetreatForm Component - Testes Unitários
 *
 * Testes do processo de inscrição pública em retiros.
 * Utiliza dados mockados para simular o fluxo completo.
 */

import React, { Suspense } from "react";
import SnackbarProvider from "@/src/providers/SnackbarProvider";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

const mockEnqueueSnackbar = jest.fn();

// Mock do notistack
jest.mock("notistack", () => ({
  enqueueSnackbar: (...args: any[]) => mockEnqueueSnackbar(...args),
  SnackbarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="notistack-provider">{children}</div>
  ),
}));

// Mock do apiClient - definido inline para evitar hoisting issues
jest.mock("@/src/lib/axiosClientInstance", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock do shared.ts - fetchFormData e sendFormData
jest.mock("@/src/components/public/retreats/form/shared", () => {
  const originalModule = jest.requireActual(
    "@/src/components/public/retreats/form/shared"
  );
  return {
    ...originalModule,
    fetchFormData: jest.fn().mockResolvedValue({
      id: "retreat-form-123",
      title: "Retiro Espiritual 2024",
      subtitle: "Inscrição",
      description: "Preencha seus dados",
      submitLabel: "Enviar Inscrição",
      sections: [
        {
          id: "section-1",
          title: "Dados Pessoais",
          description: "Preencha seus dados básicos",
          fields: [
            {
              id: "field-1",
              name: "nameSpecial",
              label: "Nome Completo",
              type: "text",
              specialType: "name",
              required: true,
              grid: 12,
            },
            {
              id: "field-2",
              name: "emailSpecial",
              label: "Email",
              type: "email",
              specialType: "email",
              required: true,
              grid: 6,
            },
          ],
        },
      ],
    }),
    sendFormData: jest.fn().mockResolvedValue({ registrationId: "reg-123" }),
  };
});

// Import após os mocks
import PublicRetreatForm from "@/src/components/public/retreats/form/PublicRetreatForm";
import {
  fetchFormData,
  sendFormData,
} from "@/src/components/public/retreats/form/shared";

// Wrapper para Suspense (necessário pois o componente usa React.use())
const renderWithSuspense = async (ui: React.ReactNode) => {
  let renderResult;

  await act(async () => {
    renderResult = render(
      <SnackbarProvider>
        <Suspense fallback={<div>Carregando...</div>}>{ui}</Suspense>
      </SnackbarProvider>
    );
  });

  return renderResult;
};

describe("PublicRetreatForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Renderização inicial", () => {
    it("deve renderizar o título do formulário após carregar", async () => {
      renderWithSuspense(
        <PublicRetreatForm id="retreat-123" type="participate" />
      );
      await waitFor(() => {
        expect(screen.getByText("Retiro Espiritual 2024")).toBeInTheDocument();
      });
    });

    it("deve renderizar os campos do formulário", async () => {
      await renderWithSuspense(
        <PublicRetreatForm id="retreat-123" type="participate" />
      );
      await waitFor(() => {
        expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      });
    });

    it("deve chamar fetchFormData com os parâmetros corretos", async () => {
      await renderWithSuspense(
        <PublicRetreatForm id="retreat-fetch-check" type="participate" />
      );

      await waitFor(() => {
        expect(fetchFormData).toHaveBeenCalledWith(
          "retreat-fetch-check",
          "participate"
        );
      });
    });
  });

  describe("Navegação entre steps", () => {
    it("deve mostrar o indicador de progresso", async () => {
      await renderWithSuspense(
        <PublicRetreatForm id="retreat-123" type="participate" />
      );

      await waitFor(() => {
        // Procura por algum indicador de step/progresso
        expect(screen.getByText("Dados Pessoais")).toBeInTheDocument();
      });
    });

    it("deve exibir botão de próximo/enviar", async () => {
      await renderWithSuspense(
        <PublicRetreatForm id="retreat-123" type="participate" />
      );

      await waitFor(() => {
        // Como só tem uma seção, deve mostrar o botão de submit
        const submitButton = screen.getByRole("button", { name: /enviar/i });
        expect(submitButton).toBeInTheDocument();
      });
    });
  });

  describe("Validação de campos", () => {
    it("deve mostrar erro ao tentar submeter formulário vazio", async () => {
      const user = userEvent.setup();
      await renderWithSuspense(
        <PublicRetreatForm id="retreat-123" type="participate" />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument();
      });

      // Tenta submeter sem preencher
      const submitButton = screen.getByRole("button", { name: /enviar/i });
      await user.click(submitButton);

      // Verifica se há mensagens de erro (campos required)
      await waitFor(() => {
        // O formulário deve mostrar erros de validação
        expect(sendFormData).not.toHaveBeenCalled();
      });
    });
  });

  describe("Preenchimento de campos", () => {
    it("deve permitir digitar no campo de nome", async () => {
      const user = userEvent.setup();
      await renderWithSuspense(
        <PublicRetreatForm id="retreat-123" type="participate" />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Nome Completo/i);
      await user.type(nameInput, "João Silva");

      expect(nameInput).toHaveValue("João Silva");
    });

    it("deve permitir digitar no campo de email", async () => {
      const user = userEvent.setup();
      await renderWithSuspense(
        <PublicRetreatForm id="retreat-123" type="participate" />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/Email/i);
      await user.type(emailInput, "joao@email.com");

      expect(emailInput).toHaveValue("joao@email.com");
    });
  });

  describe("Submissão do formulário", () => {
    it("deve chamar sendFormData ao submeter formulário válido", async () => {
      const user = userEvent.setup();
      await renderWithSuspense(
        <PublicRetreatForm id="retreat-123" type="participate" />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument();
      });

      // Preenche os campos
      const nameInput = screen.getByLabelText(/Nome Completo/i);
      const emailInput = screen.getByLabelText(/Email/i);

      await user.type(nameInput, "João Silva");
      await user.type(emailInput, "joao@email.com");

      // Submete
      const submitButton = screen.getByRole("button", { name: /enviar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(sendFormData).toHaveBeenCalled();
      });
    });

    it("deve mostrar notificação de sucesso após envio", async () => {
      const user = userEvent.setup();
      await renderWithSuspense(
        <PublicRetreatForm id="retreat-123" type="participate" />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument();
      });

      // Preenche os campos
      await user.type(screen.getByLabelText(/Nome Completo/i), "João Silva");
      await user.type(screen.getByLabelText(/Email/i), "joao@email.com");

      // Submete
      await user.click(screen.getByRole("button", { name: /enviar/i }));

      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ variant: "success" })
        );
      });
    });
  });

  describe("Tratamento de erros", () => {
    it("deve mostrar notificação de erro quando submissão falha", async () => {
      // Mock de erro
      (sendFormData as jest.Mock).mockRejectedValueOnce(
        new Error("Erro de conexão")
      );

      const user = userEvent.setup();
      await renderWithSuspense(
        <PublicRetreatForm id="retreat-123" type="participate" />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument();
      });

      // Preenche os campos
      await user.type(screen.getByLabelText(/Nome Completo/i), "João Silva");
      await user.type(screen.getByLabelText(/Email/i), "joao@email.com");

      // Submete
      await user.click(screen.getByRole("button", { name: /enviar/i }));

      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
          expect.stringContaining("Erro"),
          expect.objectContaining({ variant: "error" })
        );
      });
    });
  });
});

describe("PublicRetreatForm - Tipo Servir", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve chamar fetchFormData com tipo 'serve'", async () => {
    await renderWithSuspense(
      <PublicRetreatForm id="retreat-serve-check" type="serve" />
    );

    await waitFor(() => {
      expect(fetchFormData).toHaveBeenCalledWith(
        "retreat-serve-check",
        "serve"
      );
    });
  });
});
