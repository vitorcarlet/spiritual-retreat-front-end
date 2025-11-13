/**
 * Testes de Acessibilidade - Formulário de Login
 *
 * Valida formulários acessíveis: labels, mensagens de erro, validação
 */

import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import userEvent from "@testing-library/user-event";

expect.extend(toHaveNoViolations);

// Mock do componente LoginForm (ajustar conforme sua estrutura)
const LoginForm = ({ onSubmit, error }: any) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      aria-label="Formulário de login"
    >
      <div>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          aria-required="true"
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? "email-error" : undefined}
        />
        {error && (
          <span id="email-error" role="alert" aria-live="polite">
            {error}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          name="password"
          type="password"
          aria-required="true"
        />
      </div>

      <button type="submit" aria-label="Entrar no sistema">
        Entrar
      </button>
    </form>
  );
};

describe("Acessibilidade - Formulário de Login", () => {
  describe("WCAG 2.1 Compliance", () => {
    it("não deve ter violações de acessibilidade", async () => {
      const { container } = render(<LoginForm />);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });

    it("não deve ter violações com mensagem de erro", async () => {
      const { container } = render(<LoginForm error="E-mail inválido" />);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });
  });

  describe("Labels e Associações", () => {
    it("todos os inputs devem ter labels associados", () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("E-mail");
      const passwordInput = screen.getByLabelText("Senha");

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it("labels devem estar corretamente vinculados via htmlFor/id", () => {
      render(<LoginForm />);

      const emailLabel = screen.getByText("E-mail");
      const emailInput = screen.getByLabelText("E-mail");

      expect(emailLabel).toHaveAttribute("for", "email");
      expect(emailInput).toHaveAttribute("id", "email");
    });
  });

  describe("Campos Obrigatórios", () => {
    it('campos obrigatórios devem ter aria-required="true"', () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("E-mail");
      const passwordInput = screen.getByLabelText("Senha");

      expect(emailInput).toHaveAttribute("aria-required", "true");
      expect(passwordInput).toHaveAttribute("aria-required", "true");
    });
  });

  describe("Mensagens de Erro", () => {
    it('erro deve ter role="alert" para anúncio imediato', () => {
      render(<LoginForm error="E-mail inválido" />);

      const errorMessage = screen.getByRole("alert");
      expect(errorMessage).toHaveTextContent("E-mail inválido");
    });

    it('erro deve ter aria-live="polite"', () => {
      render(<LoginForm error="E-mail inválido" />);

      const errorMessage = screen.getByRole("alert");
      expect(errorMessage).toHaveAttribute("aria-live", "polite");
    });

    it('input com erro deve ter aria-invalid="true"', () => {
      render(<LoginForm error="E-mail inválido" />);

      const emailInput = screen.getByLabelText("E-mail");
      expect(emailInput).toHaveAttribute("aria-invalid", "true");
    });

    it("input com erro deve referenciar mensagem via aria-describedby", () => {
      render(<LoginForm error="E-mail inválido" />);

      const emailInput = screen.getByLabelText("E-mail");
      const errorMessage = screen.getByRole("alert");

      expect(emailInput).toHaveAttribute("aria-describedby", "email-error");
      expect(errorMessage).toHaveAttribute("id", "email-error");
    });
  });

  describe("Navegação por Teclado", () => {
    it("deve permitir navegação Tab entre campos", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("E-mail");
      const passwordInput = screen.getByLabelText("Senha");
      const submitButton = screen.getByRole("button", { name: /entrar/i });

      // Tab para email
      await user.tab();
      expect(emailInput).toHaveFocus();

      // Tab para senha
      await user.tab();
      expect(passwordInput).toHaveFocus();

      // Tab para botão
      await user.tab();
      expect(submitButton).toHaveFocus();
    });

    it("deve submeter formulário com Enter no botão", async () => {
      const user = userEvent.setup();
      const handleSubmit = jest.fn();
      render(<LoginForm onSubmit={handleSubmit} />);

      const submitButton = screen.getByRole("button", { name: /entrar/i });
      submitButton.focus();

      await user.keyboard("{Enter}");

      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe("Botões Acessíveis", () => {
    it("botão deve ter aria-label descritivo", () => {
      render(<LoginForm />);

      const button = screen.getByRole("button", { name: "Entrar no sistema" });
      expect(button).toBeInTheDocument();
    });

    it('botão deve ter type="submit" explícito', () => {
      render(<LoginForm />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
    });
  });

  describe("Formulário Semântico", () => {
    it("deve usar elemento <form> nativo", () => {
      const { container } = render(<LoginForm />);

      const form = container.querySelector("form");
      expect(form).toBeInTheDocument();
    });

    it("formulário deve ter aria-label", () => {
      const { container } = render(<LoginForm />);

      const form = container.querySelector("form");
      expect(form).toHaveAttribute("aria-label", "Formulário de login");
    });
  });
});
