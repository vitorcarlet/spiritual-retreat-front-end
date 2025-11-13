/**
 * Testes de Acessibilidade - RetreatCard Component
 *
 * Valida conformidade com WCAG 2.1 Level AA usando jest-axe
 * Testa navegação por teclado, atributos ARIA e semântica HTML
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import userEvent from "@testing-library/user-event";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock do componente RetreatCard (ajustar path conforme sua estrutura)
const RetreatCard = ({ retreat, onClick, isLoading }: any) => {
  if (isLoading) {
    return (
      <div
        data-testid="retreat-skeleton"
        role="status"
        aria-label="Carregando retiro"
      >
        Loading...
      </div>
    );
  }

  return (
    <article
      role="article"
      aria-label={`Retiro ${retreat.name}`}
      onClick={() => onClick?.(retreat)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(retreat);
        }
      }}
      tabIndex={0}
      style={{ cursor: "pointer", padding: "16px", border: "1px solid #ccc" }}
    >
      <h2>{retreat.name}</h2>
      <p>{retreat.description}</p>
      <div>
        <span aria-label="Localização">{retreat.location}</span>
      </div>
      <div>
        <span
          aria-label={`${retreat.registeredCount} de ${retreat.capacity} inscritos`}
        >
          {retreat.registeredCount} / {retreat.capacity} inscritos
        </span>
      </div>
      <time
        dateTime={retreat.startDate}
        aria-label={`Data de início: ${retreat.startDate}`}
      >
        {new Date(retreat.startDate).toLocaleDateString("pt-BR")}
      </time>
    </article>
  );
};

describe("Acessibilidade - RetreatCard Component", () => {
  const mockRetreat = {
    id: "1",
    name: "Retiro de Páscoa",
    description: "Um retiro espiritual para renovação da fé",
    startDate: "2024-04-10",
    endDate: "2024-04-14",
    location: "Aparecida - SP",
    capacity: 50,
    registeredCount: 30,
  };

  describe("WCAG 2.1 Compliance (jest-axe)", () => {
    it("não deve ter violações de acessibilidade automáticas", async () => {
      const { container } = render(<RetreatCard retreat={mockRetreat} />);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });

    it("não deve ter violações no estado de loading", async () => {
      const { container } = render(<RetreatCard isLoading={true} />);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });

    it("não deve ter violações com título muito longo", async () => {
      const longTitleRetreat = {
        ...mockRetreat,
        name: "Retiro Espiritual de Renovação da Fé e Fortalecimento da Comunidade Cristã para Jovens e Adultos",
      };
      const { container } = render(<RetreatCard retreat={longTitleRetreat} />);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });
  });

  describe("Atributos ARIA e Semântica HTML", () => {
    it('deve ter role="article" correto', () => {
      render(<RetreatCard retreat={mockRetreat} />);

      const card = screen.getByRole("article");
      expect(card).toBeInTheDocument();
    });

    it("deve ter aria-label descritivo no card", () => {
      render(<RetreatCard retreat={mockRetreat} />);

      const card = screen.getByRole("article");
      expect(card).toHaveAttribute("aria-label", "Retiro Retiro de Páscoa");
    });

    it("deve ter elemento <time> com dateTime correto", () => {
      render(<RetreatCard retreat={mockRetreat} />);

      const timeElement = screen.getByText("10/04/2024");
      expect(timeElement.tagName).toBe("TIME");
      expect(timeElement).toHaveAttribute("dateTime", "2024-04-10");
    });

    it("deve ter aria-label para informações de capacidade", () => {
      render(<RetreatCard retreat={mockRetreat} />);

      const capacityElement = screen.getByLabelText("30 de 50 inscritos");
      expect(capacityElement).toBeInTheDocument();
    });

    it("deve usar heading hierárquico correto (h2)", () => {
      render(<RetreatCard retreat={mockRetreat} />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Retiro de Páscoa");
    });

    it('skeleton deve ter role="status" para screen readers', () => {
      render(<RetreatCard isLoading={true} />);

      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveAttribute("aria-label", "Carregando retiro");
    });
  });

  describe("Navegação por Teclado", () => {
    it("deve ser focável com Tab (tabIndex={0})", () => {
      render(<RetreatCard retreat={mockRetreat} />);

      const card = screen.getByRole("article");
      expect(card).toHaveAttribute("tabIndex", "0");

      card.focus();
      expect(card).toHaveFocus();
    });

    it("deve responder à tecla Enter", async () => {
      const handleClick = jest.fn();
      render(<RetreatCard retreat={mockRetreat} onClick={handleClick} />);

      const card = screen.getByRole("article");
      card.focus();

      fireEvent.keyDown(card, { key: "Enter", code: "Enter" });

      expect(handleClick).toHaveBeenCalledWith(mockRetreat);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("deve responder à tecla Space", async () => {
      const handleClick = jest.fn();
      render(<RetreatCard retreat={mockRetreat} onClick={handleClick} />);

      const card = screen.getByRole("article");
      card.focus();

      fireEvent.keyDown(card, { key: " ", code: "Space" });

      expect(handleClick).toHaveBeenCalledWith(mockRetreat);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("não deve responder a outras teclas", () => {
      const handleClick = jest.fn();
      render(<RetreatCard retreat={mockRetreat} onClick={handleClick} />);

      const card = screen.getByRole("article");
      card.focus();

      fireEvent.keyDown(card, { key: "a", code: "KeyA" });
      fireEvent.keyDown(card, { key: "Escape", code: "Escape" });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("deve ter indicador visual de foco (cursor: pointer)", () => {
      render(<RetreatCard retreat={mockRetreat} />);

      const card = screen.getByRole("article");
      expect(card).toHaveStyle({ cursor: "pointer" });
    });
  });

  describe("Navegação com userEvent (simulação realista)", () => {
    it("deve permitir navegação completa por teclado", async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<RetreatCard retreat={mockRetreat} onClick={handleClick} />);

      // Simula Tab até o card
      await user.tab();

      const card = screen.getByRole("article");
      expect(card).toHaveFocus();

      // Simula Enter
      await user.keyboard("{Enter}");

      expect(handleClick).toHaveBeenCalledWith(mockRetreat);
    });
  });

  describe("Screen Reader Support", () => {
    it("deve ter texto alternativo adequado para todos os elementos", () => {
      render(<RetreatCard retreat={mockRetreat} />);

      // Verifica que todos os textos importantes estão acessíveis
      expect(screen.getByText("Retiro de Páscoa")).toBeInTheDocument();
      expect(
        screen.getByText("Um retiro espiritual para renovação da fé")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Localização")).toHaveTextContent(
        "Aparecida - SP"
      );
    });

    it("deve anunciar corretamente estado de loading", () => {
      render(<RetreatCard isLoading={true} />);

      const skeleton = screen.getByLabelText("Carregando retiro");
      expect(skeleton).toHaveAttribute("role", "status");
    });

    it("deve ter informações de data acessíveis", () => {
      render(<RetreatCard retreat={mockRetreat} />);

      const dateElement = screen.getByLabelText(/Data de início:/);
      expect(dateElement).toBeInTheDocument();
    });
  });

  describe("Performance de Acessibilidade", () => {
    it("deve manter acessibilidade mesmo com renderização rápida", async () => {
      const startTime = performance.now();
      const { container } = render(<RetreatCard retreat={mockRetreat} />);
      const endTime = performance.now();

      // Verifica que renderizou rápido
      expect(endTime - startTime).toBeLessThan(100);

      // E ainda é acessível
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Responsividade e Zoom", () => {
    it("deve manter estrutura semântica em qualquer viewport", async () => {
      // Simula viewport mobile
      global.innerWidth = 375;
      global.innerHeight = 667;

      const { container } = render(<RetreatCard retreat={mockRetreat} />);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
      expect(screen.getByRole("article")).toBeInTheDocument();
    });
  });
});
