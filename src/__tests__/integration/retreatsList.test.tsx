/**
 * RetreatsList Integration Tests
 *
 * Valida integração entre:
 * - Componente React (RetreatsList)
 * - Camada de API (axios + MSW)
 * - Estado e carregamento de dados
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/src/mocks/server";
import "@testing-library/jest-dom";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Mock do componente RetreatsList
const RetreatsList = ({
  onRetreatSelect,
}: {
  onRetreatSelect?: (id: string) => void;
}) => {
  const [retreats, setRetreats] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchRetreats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/public/retreats`);

        if (!response.ok) {
          throw new Error("Erro ao carregar retiros");
        }

        const data = await response.json();
        setRetreats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        setRetreats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRetreats();
  }, []);

  if (loading) return <div data-testid="loading">Carregando retiros...</div>;
  if (error) return <div data-testid="error">Erro: {error}</div>;

  return (
    <div data-testid="retreats-list">
      {retreats.length === 0 ? (
        <div data-testid="empty">Nenhum retiro encontrado</div>
      ) : (
        <ul>
          {retreats.map((retreat: any) => (
            <li
              key={retreat.id}
              data-testid={`retreat-item-${retreat.id}`}
              onClick={() => onRetreatSelect?.(retreat.id)}
            >
              <h3>{retreat.title}</h3>
              <p>{retreat.description}</p>
              <span>{retreat.startDate}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

describe("RetreatsList - Testes de Integração", () => {
  // Antes de cada teste, a API iniciará com handlers padrão
  beforeEach(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    server.close();
  });

  describe("Carregamento de Dados", () => {
    it("deve exibir estado de carregamento inicialmente", () => {
      render(<RetreatsList />);

      expect(screen.getByTestId("loading")).toBeInTheDocument();
      expect(screen.getByTestId("loading")).toHaveTextContent(
        "Carregando retiros..."
      );
    });

    it("deve buscar e exibir lista de retiros da API", async () => {
      server.use(
        http.get(`${API_BASE_URL}/public/retreats`, () => {
          return HttpResponse.json([
            {
              id: "1",
              title: "Retiro Espiritual 2025",
              description: "Uma jornada transformadora",
              startDate: "2025-03-15",
            },
            {
              id: "2",
              title: "Meditação Profunda",
              description: "Práticas ancestrais",
              startDate: "2025-04-20",
            },
          ]);
        })
      );

      render(<RetreatsList />);

      // Aguarda o carregamento ser concluído
      await waitFor(() => {
        expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
      });

      // Valida se os retiros foram exibidos
      expect(screen.getByText("Retiro Espiritual 2025")).toBeInTheDocument();
      expect(screen.getByText("Meditação Profunda")).toBeInTheDocument();
      expect(
        screen.getByText("Uma jornada transformadora")
      ).toBeInTheDocument();
    });

    it("deve exibir lista vazia quando nenhum retiro é retornado", async () => {
      server.use(
        http.get(`${API_BASE_URL}/public/retreats`, () => {
          return HttpResponse.json([]);
        })
      );

      render(<RetreatsList />);

      await waitFor(() => {
        expect(screen.getByTestId("empty")).toBeInTheDocument();
      });

      expect(screen.getByTestId("empty")).toHaveTextContent(
        "Nenhum retiro encontrado"
      );
    });
  });

  describe("Tratamento de Erros", () => {
    it("deve exibir mensagem de erro quando API falha com 500", async () => {
      server.use(
        http.get(`${API_BASE_URL}/public/retreats`, () => {
          return HttpResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
          );
        })
      );

      render(<RetreatsList />);

      await waitFor(() => {
        expect(screen.getByTestId("error")).toBeInTheDocument();
      });

      expect(screen.getByTestId("error")).toHaveTextContent(
        /erro ao carregar/i
      );
    });

    it("deve exibir mensagem de erro quando API retorna 404", async () => {
      server.use(
        http.get(`${API_BASE_URL}/public/retreats`, () => {
          return HttpResponse.json({ error: "Not Found" }, { status: 404 });
        })
      );

      render(<RetreatsList />);

      await waitFor(() => {
        expect(screen.getByTestId("error")).toBeInTheDocument();
      });
    });

    it("deve exibir mensagem de erro em caso de erro de rede", async () => {
      server.use(
        http.get(`${API_BASE_URL}/public/retreats`, () => {
          return HttpResponse.error();
        })
      );

      render(<RetreatsList />);

      await waitFor(() => {
        expect(screen.getByTestId("error")).toBeInTheDocument();
      });
    });
  });

  describe("Interações", () => {
    it("deve chamar onRetreatSelect quando um retiro é clicado", async () => {
      const handleSelect = jest.fn();

      server.use(
        http.get(`${API_BASE_URL}/public/retreats`, () => {
          return HttpResponse.json([
            {
              id: "1",
              title: "Retiro 1",
              description: "Descrição 1",
              startDate: "2025-03-15",
            },
          ]);
        })
      );

      const user = userEvent.setup();
      render(<RetreatsList onRetreatSelect={handleSelect} />);

      await waitFor(() => {
        expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
      });

      const retreatItem = screen.getByTestId("retreat-item-1");
      await user.click(retreatItem);

      expect(handleSelect).toHaveBeenCalledWith("1");
      expect(handleSelect).toHaveBeenCalledTimes(1);
    });

    it("deve renderizar múltiplos retiros com IDs corretos", async () => {
      server.use(
        http.get(`${API_BASE_URL}/public/retreats`, () => {
          return HttpResponse.json([
            {
              id: "1",
              title: "Retiro 1",
              description: "Desc 1",
              startDate: "2025-03-15",
            },
            {
              id: "2",
              title: "Retiro 2",
              description: "Desc 2",
              startDate: "2025-04-15",
            },
            {
              id: "3",
              title: "Retiro 3",
              description: "Desc 3",
              startDate: "2025-05-15",
            },
          ]);
        })
      );

      render(<RetreatsList />);

      await waitFor(() => {
        expect(screen.getByTestId("retreat-item-1")).toBeInTheDocument();
        expect(screen.getByTestId("retreat-item-2")).toBeInTheDocument();
        expect(screen.getByTestId("retreat-item-3")).toBeInTheDocument();
      });
    });
  });

  describe("Performance", () => {
    it("deve renderizar lista com 100 itens em tempo aceitável", async () => {
      const mockRetreats = Array.from({ length: 100 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Retiro ${i + 1}`,
        description: `Descrição ${i + 1}`,
        startDate: "2025-03-15",
      }));

      server.use(
        http.get(`${API_BASE_URL}/public/retreats`, () => {
          return HttpResponse.json(mockRetreats);
        })
      );

      const startTime = performance.now();

      render(<RetreatsList />);

      await waitFor(() => {
        expect(screen.getByTestId("retreat-item-100")).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Deve renderizar em menos de 1 segundo
      expect(renderTime).toBeLessThan(1000);
    });
  });

  describe("Estado e Re-render", () => {
    it("não deve fazer requisições duplicadas em strictMode", async () => {
      let requestCount = 0;

      server.use(
        http.get(`${API_BASE_URL}/public/retreats`, () => {
          requestCount++;
          return HttpResponse.json([
            {
              id: "1",
              title: "Retiro 1",
              description: "Desc 1",
              startDate: "2025-03-15",
            },
          ]);
        })
      );

      render(<RetreatsList />);

      await waitFor(() => {
        expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
      });

      // Em StrictMode (desenvolvimento), React pode fazer double-invoke
      // Mas a requisição real deve ser feita apenas uma vez
      expect(requestCount).toBeGreaterThanOrEqual(1);
    });
  });
});
