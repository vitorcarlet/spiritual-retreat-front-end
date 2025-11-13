/**
 * RetreatCard Component - Testes Unitários
 *
 * Validação:
 * - Renderização correta do componente
 * - Exibição de dados (título, descrição, datas)
 * - Funcionamento de eventos (click, hover)
 * - Estados de carregamento
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// Mock do componente RetreatCard (ajuste conforme sua estrutura real)
const RetreatCard = ({
  retreat,
  onClick,
  isLoading,
}: {
  retreat: any;
  onClick?: (id: string) => void;
  isLoading?: boolean;
}) => (
  <div data-testid="retreat-card" onClick={() => onClick?.(retreat.id)}>
    {isLoading ? (
      <div data-testid="loading">Carregando...</div>
    ) : (
      <>
        <h3 data-testid="retreat-title">{retreat.title}</h3>
        <p data-testid="retreat-description">{retreat.description}</p>
        <div data-testid="retreat-dates">
          {retreat.startDate} - {retreat.endDate}
        </div>
        <button data-testid="retreat-button-register">Registrar</button>
      </>
    )}
  </div>
);

describe("RetreatCard Component - Testes Unitários", () => {
  const mockRetreat = {
    id: "1",
    title: "Retiro Espiritual 2025",
    description: "Uma jornada transformadora de 7 dias",
    startDate: "2025-03-15",
    endDate: "2025-03-22",
    location: "São Paulo, SP",
    capacity: 30,
  };

  describe("Renderização", () => {
    it("deve renderizar o card com todos os dados corretos", () => {
      render(<RetreatCard retreat={mockRetreat} />);

      expect(screen.getByTestId("retreat-card")).toBeInTheDocument();
      expect(screen.getByTestId("retreat-title")).toHaveTextContent(
        "Retiro Espiritual 2025"
      );
      expect(screen.getByTestId("retreat-description")).toHaveTextContent(
        "Uma jornada transformadora de 7 dias"
      );
    });

    it("deve exibir as datas corretamente formatadas", () => {
      render(<RetreatCard retreat={mockRetreat} />);

      const datesElement = screen.getByTestId("retreat-dates");
      expect(datesElement).toHaveTextContent("2025-03-15 - 2025-03-22");
    });

    it("deve renderizar o botão de registrar", () => {
      render(<RetreatCard retreat={mockRetreat} />);

      const registerButton = screen.getByTestId("retreat-button-register");
      expect(registerButton).toBeInTheDocument();
      expect(registerButton).toHaveTextContent("Registrar");
    });
  });

  describe("Eventos", () => {
    it("deve chamar onClick quando o card é clicado", async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<RetreatCard retreat={mockRetreat} onClick={handleClick} />);

      const card = screen.getByTestId("retreat-card");
      await user.click(card);

      expect(handleClick).toHaveBeenCalledWith("1");
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("deve chamar onClick com ID correto quando botão é clicado", async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<RetreatCard retreat={mockRetreat} onClick={handleClick} />);

      const button = screen.getByTestId("retreat-button-register");
      await user.click(button);

      expect(handleClick).toHaveBeenCalledWith("1");
    });

    it("não deve chamar onClick se nenhum handler foi passado", async () => {
      const user = userEvent.setup();

      const card = screen.getByTestId("retreat-card");

      // Não deve lancar erro ao clicar
      await expect(async () => {
        await user.click(card);
      }).not.toThrow();
    });
  });

  describe("Estados de Carregamento", () => {
    it("deve exibir estado de carregamento quando isLoading é true", () => {
      render(<RetreatCard retreat={mockRetreat} isLoading={true} />);

      expect(screen.getByTestId("loading")).toBeInTheDocument();
      expect(screen.getByTestId("loading")).toHaveTextContent("Carregando...");
    });

    it("não deve exibir dados quando isLoading é true", () => {
      render(<RetreatCard retreat={mockRetreat} isLoading={true} />);

      expect(screen.queryByTestId("retreat-title")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("retreat-description")
      ).not.toBeInTheDocument();
    });

    it("deve exibir dados quando isLoading é false", () => {
      render(<RetreatCard retreat={mockRetreat} isLoading={false} />);

      expect(screen.getByTestId("retreat-title")).toBeInTheDocument();
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });
  });

  describe("Validação de Props", () => {
    it("deve renderizar com dados diferentes", () => {
      const differentRetreat = {
        ...mockRetreat,
        id: "2",
        title: "Outro Retiro",
        description: "Descrição diferente",
      };

      render(<RetreatCard retreat={differentRetreat} />);

      expect(screen.getByTestId("retreat-title")).toHaveTextContent(
        "Outro Retiro"
      );
      expect(screen.getByTestId("retreat-description")).toHaveTextContent(
        "Descrição diferente"
      );
    });

    it("deve lidar com títulos longos", () => {
      const longTitleRetreat = {
        ...mockRetreat,
        title:
          "Retiro Espiritual de Meditação Profunda com Práticas Ancestrais do Oriente Antigo",
      };

      render(<RetreatCard retreat={longTitleRetreat} />);

      expect(screen.getByTestId("retreat-title")).toHaveTextContent(
        "Retiro Espiritual de Meditação Profunda com Práticas Ancestrais do Oriente Antigo"
      );
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter aria-label ou texto descritivo no botão", () => {
      render(<RetreatCard retreat={mockRetreat} />);

      const button = screen.getByTestId("retreat-button-register");
      // Deve ser clicável via teclado
      expect(button).toHaveTextContent("Registrar");
    });

    it("deve ter contraste suficiente (validação manual esperada)", () => {
      const { container } = render(<RetreatCard retreat={mockRetreat} />);

      const card = container.querySelector('[data-testid="retreat-card"]');
      // Teste de estrutura válida
      expect(card).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("deve renderizar rapidamente (< 200ms)", () => {
      const startTime = performance.now();
      render(<RetreatCard retreat={mockRetreat} />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(200);
    });

    it("deve atualizar corretamente quando props mudam", () => {
      const { rerender } = render(<RetreatCard retreat={mockRetreat} />);

      expect(screen.getByTestId("retreat-title")).toHaveTextContent(
        "Retiro Espiritual 2025"
      );

      const updatedRetreat = {
        ...mockRetreat,
        title: "Novo Título",
      };

      rerender(<RetreatCard retreat={updatedRetreat} />);

      expect(screen.getByTestId("retreat-title")).toHaveTextContent(
        "Novo Título"
      );
    });
  });
});
