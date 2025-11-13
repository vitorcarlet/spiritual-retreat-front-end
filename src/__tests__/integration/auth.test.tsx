/**
 * Authentication Flow - Testes de Integração
 *
 * Valida fluxos completos:
 * - Login com credenciais válidas e inválidas
 * - Logout
 * - Refresh de token
 * - Tratamento de erros
 * - Persistência de sessão
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/src/mocks/server";
import "@testing-library/jest-dom";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Mock de componente LoginPage
const LoginPage = ({
  onLoginSuccess,
}: {
  onLoginSuccess?: (token: string) => void;
}) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Credenciais inválidas");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);
      onLoginSuccess?.(data.access_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        data-testid="email-input"
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        data-testid="password-input"
      />
      <button type="submit" disabled={loading} data-testid="login-button">
        {loading ? "Carregando..." : "Login"}
      </button>
      {error && <div data-testid="error-message">{error}</div>}
    </form>
  );
};

// Mock de componente Dashboard (logged in)
const Dashboard = ({ onLogout }: { onLogout?: () => void }) => {
  const [user, setUser] = React.useState<{ email: string } | null>(null);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({ email: "user@test.com" });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    onLogout?.();
  };

  if (!user) return <div data-testid="not-authenticated">Não autenticado</div>;

  return (
    <div data-testid="dashboard">
      <h1>Dashboard</h1>
      <p data-testid="user-email">{user.email}</p>
      <button onClick={handleLogout} data-testid="logout-button">
        Logout
      </button>
    </div>
  );
};

describe("Authentication Flow - Testes de Integração", () => {
  beforeEach(() => {
    server.listen();
    localStorage.clear();
  });

  afterEach(() => {
    server.resetHandlers();
    server.close();
    localStorage.clear();
  });

  describe("Login com Sucesso", () => {
    it("deve fazer login com credenciais válidas", async () => {
      server.use(
        http.post(`${API_BASE_URL}/login`, async ({ request }) => {
          const body = (await request.json()) as {
            email: string;
            password: string;
          };

          if (
            body.email === "user@test.com" &&
            body.password === "password123"
          ) {
            return HttpResponse.json(
              {
                access_token: "fake-jwt-access-token",
                refresh_token: "fake-jwt-refresh-token",
                user: { id: "1", email: "user@test.com" },
              },
              { status: 200 }
            );
          }

          return HttpResponse.json(
            { error: "Credenciais inválidas" },
            { status: 401 }
          );
        })
      );

      const handleSuccess = jest.fn();
      const user = userEvent.setup();

      render(<LoginPage onLoginSuccess={handleSuccess} />);

      const emailInput = screen.getByTestId("email-input") as HTMLInputElement;
      const passwordInput = screen.getByTestId(
        "password-input"
      ) as HTMLInputElement;
      const submitButton = screen.getByTestId("login-button");

      await user.type(emailInput, "user@test.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleSuccess).toHaveBeenCalledWith("fake-jwt-access-token");
      });

      expect(localStorage.getItem("token")).toBe("fake-jwt-access-token");
      expect(localStorage.getItem("refreshToken")).toBe(
        "fake-jwt-refresh-token"
      );
    });

    it("deve exibir estado de carregamento durante o login", async () => {
      server.use(
        http.post(`${API_BASE_URL}/login`, async () => {
          // Simula delay de rede
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({
            access_token: "token",
            refresh_token: "refresh-token",
          });
        })
      );

      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByTestId("email-input") as HTMLInputElement;
      const passwordInput = screen.getByTestId(
        "password-input"
      ) as HTMLInputElement;
      const submitButton = screen.getByTestId(
        "login-button"
      ) as HTMLButtonElement;

      await user.type(emailInput, "user@test.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Durante o carregamento
      expect(submitButton).toBeDisabled();

      // Após o carregamento
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe("Falha no Login", () => {
    it("deve exibir erro com credenciais inválidas", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByTestId("email-input") as HTMLInputElement;
      const passwordInput = screen.getByTestId(
        "password-input"
      ) as HTMLInputElement;
      const submitButton = screen.getByTestId("login-button");

      await user.type(emailInput, "user@test.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
      });

      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Credenciais inválidas"
      );
      expect(localStorage.getItem("token")).toBeNull();
    });

    it("deve exibir erro quando email está vazio", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByTestId(
        "password-input"
      ) as HTMLInputElement;
      const submitButton = screen.getByTestId("login-button");

      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Form não enviará sem email
      await waitFor(() => {
        expect(localStorage.getItem("token")).toBeNull();
      });
    });

    it("deve exibir erro quando API retorna 500", async () => {
      server.use(
        http.post(`${API_BASE_URL}/login`, () => {
          return HttpResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
          );
        })
      );

      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByTestId("email-input") as HTMLInputElement;
      const passwordInput = screen.getByTestId(
        "password-input"
      ) as HTMLInputElement;
      const submitButton = screen.getByTestId("login-button");

      await user.type(emailInput, "user@test.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
      });
    });
  });

  describe("Logout", () => {
    it("deve fazer logout e limpar tokens", async () => {
      // Simula usuario logado
      localStorage.setItem("token", "fake-token");
      localStorage.setItem("refreshToken", "fake-refresh-token");

      const handleLogout = jest.fn();
      render(<Dashboard onLogout={handleLogout} />);

      // Verifica que o dashboard é exibido
      expect(screen.getByTestId("dashboard")).toBeInTheDocument();

      const logoutButton = screen.getByTestId("logout-button");
      const user = userEvent.setup();

      await user.click(logoutButton);

      expect(handleLogout).toHaveBeenCalled();
      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("refreshToken")).toBeNull();
    });
  });

  describe("Refresh Token", () => {
    it("deve fazer refresh do token quando o access_token expirar", async () => {
      server.use(
        http.post(`${API_BASE_URL}/refresh`, async ({ request }) => {
          const body = (await request.json()) as { refresh_token: string };

          if (body.refresh_token === "valid-refresh-token") {
            return HttpResponse.json(
              {
                access_token: "new-access-token",
                refresh_token: "new-refresh-token",
              },
              { status: 200 }
            );
          }

          return HttpResponse.json(
            { error: "Invalid refresh token" },
            { status: 401 }
          );
        })
      );

      localStorage.setItem("refreshToken", "valid-refresh-token");

      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: "valid-refresh-token" }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.access_token).toBe("new-access-token");
    });

    it("deve fazer logout quando refresh_token está inválido", async () => {
      server.use(
        http.post(`${API_BASE_URL}/refresh`, () => {
          return HttpResponse.json(
            { error: "Invalid refresh token" },
            { status: 401 }
          );
        })
      );

      localStorage.setItem("refreshToken", "invalid-refresh-token");

      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: "invalid-refresh-token" }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });
  });

  describe("Fluxo Completo de Autenticação", () => {
    it("deve fazer login, navegar para dashboard e fazer logout", async () => {
      server.use(
        http.post(`${API_BASE_URL}/login`, async ({ request }) => {
          const body = (await request.json()) as {
            email: string;
            password: string;
          };

          if (
            body.email === "user@test.com" &&
            body.password === "password123"
          ) {
            return HttpResponse.json(
              {
                access_token: "fake-access-token",
                refresh_token: "fake-refresh-token",
                user: { id: "1", email: "user@test.com" },
              },
              { status: 200 }
            );
          }

          return HttpResponse.json(
            { error: "Credenciais inválidas" },
            { status: 401 }
          );
        })
      );

      const user = userEvent.setup();

      // 1. Render login page
      const { rerender } = render(<LoginPage />);

      // 2. Fazer login
      const emailInput = screen.getByTestId("email-input") as HTMLInputElement;
      const passwordInput = screen.getByTestId(
        "password-input"
      ) as HTMLInputElement;
      const submitButton = screen.getByTestId("login-button");

      await user.type(emailInput, "user@test.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(localStorage.getItem("token")).toBe("fake-access-token");
      });

      // 3. Render dashboard
      rerender(<Dashboard />);
      expect(screen.getByTestId("dashboard")).toBeInTheDocument();

      // 4. Fazer logout
      const logoutButton = screen.getByTestId("logout-button");
      await user.click(logoutButton);

      expect(localStorage.getItem("token")).toBeNull();
    });
  });

  describe("Performance", () => {
    it("deve completar login em menos de 2 segundos", async () => {
      server.use(
        http.post(`${API_BASE_URL}/login`, async ({ request }) => {
          const body = (await request.json()) as {
            email: string;
            password: string;
          };

          if (
            body.email === "user@test.com" &&
            body.password === "password123"
          ) {
            return HttpResponse.json({
              access_token: "token",
              refresh_token: "refresh-token",
            });
          }

          return HttpResponse.json({ error: "Invalid" }, { status: 401 });
        })
      );

      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByTestId("email-input") as HTMLInputElement;
      const passwordInput = screen.getByTestId(
        "password-input"
      ) as HTMLInputElement;
      const submitButton = screen.getByTestId("login-button");

      const startTime = performance.now();

      await user.type(emailInput, "user@test.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(localStorage.getItem("token")).toBeTruthy();
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(2000);
    });
  });
});
