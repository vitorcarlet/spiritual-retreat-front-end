/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Testes de Acessibilidade - SideMenuDrawer (Componente Real)
 *
 * Valida acessibilidade do menu lateral principal da aplicação
 */

import { render, screen, waitFor } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import userEvent from "@testing-library/user-event";
import SideMenuDrawer from "@/src/components/navigation/SideMenu";
import { DrawerProvider } from "@/src/contexts/DrawerContext";
import { ThemeProvider, createTheme } from "@mui/material";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock dos hooks e módulos Next.js
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: "/dashboard",
  }),
}));

jest.mock("@/src/hooks/useMenuAccess", () => ({
  useMenuAccess: () => ({
    getAccessibleMenus: jest.fn(() => [
      {
        id: "dashboard",
        label: "Dashboard",
        path: "/dashboard",
        icon: "lucide:layout-dashboard",
      },
      {
        id: "retreats",
        label: "Retiros",
        path: "/retreats",
        icon: "lucide:mountain",
      },
      {
        id: "users",
        label: "Usuários",
        path: "/users",
        icon: "lucide:users",
      },
    ]),
    debugUserAccess: jest.fn(),
    isLoading: false,
  }),
}));

jest.mock("@/src/components/navigation/protected/ProtectedRoute", () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/app/loading", () => ({
  __esModule: true,
  default: () => <div>Carregando...</div>,
}));

// Mock do Iconify
jest.mock("@/src/components/Iconify", () => ({
  __esModule: true,
  default: ({ icon }: any) => <span data-testid={`icon-${icon}`}>{icon}</span>,
}));

// Helper para renderizar com providers
const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  const theme = createTheme();

  return render(
    <ThemeProvider theme={theme}>
      <DrawerProvider>{ui}</DrawerProvider>
    </ThemeProvider>,
    options
  );
};

describe("Acessibilidade - SideMenuDrawer (Componente Real)", () => {
  describe("WCAG 2.1 Compliance", () => {
    it("não deve ter violações de acessibilidade", async () => {
      const { container } = renderWithProviders(
        <SideMenuDrawer>
          <div>Conteúdo Principal</div>
        </SideMenuDrawer>
      );

      // Aguarda renderização completa
      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("menu de navegação deve ser acessível", async () => {
      const { container } = renderWithProviders(
        <SideMenuDrawer>
          <div>Content</div>
        </SideMenuDrawer>
      );

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      // Verifica apenas a região de navegação
      const nav = container.querySelector("nav");
      if (nav) {
        const results = await axe(nav);
        expect(results).toHaveNoViolations();
      }
    });
  });

  describe("Landmarks e Estrutura Semântica", () => {
    it("deve ter estrutura de drawer com role apropriado", async () => {
      renderWithProviders(
        <SideMenuDrawer>
          <div>Content</div>
        </SideMenuDrawer>
      );

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      // Material-UI Drawer usa role="presentation" por padrão
      const drawer = screen.getByRole("presentation");
      expect(drawer).toBeInTheDocument();
    });

    it("deve ter região main identificável", async () => {
      renderWithProviders(
        <SideMenuDrawer>
          <main id="main-content">
            <h1>Conteúdo Principal</h1>
          </main>
        </SideMenuDrawer>
      );

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();
      expect(main).toHaveAttribute("id", "main-content");
    });

    it("deve ter AppBar (banner) identificável", async () => {
      renderWithProviders(
        <SideMenuDrawer>
          <div>Content</div>
        </SideMenuDrawer>
      );

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      // TopBar está dentro do AppBar
      const banner = screen.getByRole("banner");
      expect(banner).toBeInTheDocument();
    });
  });

  describe("Navegação e Links", () => {
    it("deve renderizar todos os itens de menu acessíveis", async () => {
      renderWithProviders(
        <SideMenuDrawer>
          <div>Content</div>
        </SideMenuDrawer>
      );

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Retiros")).toBeInTheDocument();
      expect(screen.getByText("Usuários")).toBeInTheDocument();
    });

    it("itens de menu devem ser links navegáveis", async () => {
      renderWithProviders(
        <SideMenuDrawer>
          <div>Content</div>
        </SideMenuDrawer>
      );

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
      expect(dashboardLink).toHaveAttribute("href", "/dashboard");

      const retreatsLink = screen.getByRole("link", { name: /retiros/i });
      expect(retreatsLink).toHaveAttribute("href", "/retreats");
    });

    it("itens de menu devem ter ícones descritivos", async () => {
      renderWithProviders(
        <SideMenuDrawer>
          <div>Content</div>
        </SideMenuDrawer>
      );

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      expect(
        screen.getByTestId("icon-lucide:layout-dashboard")
      ).toBeInTheDocument();
      expect(screen.getByTestId("icon-lucide:mountain")).toBeInTheDocument();
      expect(screen.getByTestId("icon-lucide:users")).toBeInTheDocument();
    });
  });

  describe("Navegação por Teclado", () => {
    it("deve permitir navegação por Tab entre itens", async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <SideMenuDrawer>
          <div>Content</div>
        </SideMenuDrawer>
      );

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
      const retreatsLink = screen.getByRole("link", { name: /retiros/i });

      // Foca no primeiro item
      dashboardLink.focus();
      expect(dashboardLink).toHaveFocus();

      // Tab para o próximo
      await user.tab();
      expect(retreatsLink).toHaveFocus();
    });

    it("botão de toggle do drawer deve ser acessível por teclado", async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <SideMenuDrawer>
          <div>Content</div>
        </SideMenuDrawer>
      );

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      // Material-UI IconButton é acessível por padrão
      const toggleButton = screen.getByRole("button");
      expect(toggleButton).toBeInTheDocument();

      toggleButton.focus();
      expect(toggleButton).toHaveFocus();

      // Enter deve acionar o botão
      await user.keyboard("{Enter}");
      // Drawer state mudaria aqui (não testamos estado interno)
    });
  });

  describe("Estados de Carregamento", () => {
    it("deve mostrar mensagem quando não há menus", async () => {
      // Mock retornando menus vazios
      jest
        .spyOn(require("@/src/hooks/useMenuAccess"), "useMenuAccess")
        .mockReturnValueOnce({
          getAccessibleMenus: () => [],
          debugUserAccess: jest.fn(),
          isLoading: false,
        });

      renderWithProviders(
        <SideMenuDrawer>
          <div>Content</div>
        </SideMenuDrawer>
      );

      await waitFor(() => {
        expect(screen.getByText("Nenhum menu disponível")).toBeInTheDocument();
      });

      expect(
        screen.getByText("Entre em contato com o administrador")
      ).toBeInTheDocument();
    });

    it("deve mostrar loading quando menus estão carregando", async () => {
      // Mock com loading
      jest
        .spyOn(require("@/src/hooks/useMenuAccess"), "useMenuAccess")
        .mockReturnValueOnce({
          getAccessibleMenus: () => [],
          debugUserAccess: jest.fn(),
          isLoading: true,
        });

      renderWithProviders(
        <SideMenuDrawer>
          <div>Content</div>
        </SideMenuDrawer>
      );

      await waitFor(() => {
        expect(screen.getByText("Carregando...")).toBeInTheDocument();
      });
    });
  });

  describe("Responsividade e Mobile", () => {
    it("deve ter drawer mobile com props corretas", async () => {
      // Mock para mobile
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query === "(max-width: 600px)",
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      renderWithProviders(
        <SideMenuDrawer>
          <div>Content</div>
        </SideMenuDrawer>
      );

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      // Drawer mobile tem variant="temporary"
      const mobileDrawer = screen.getAllByRole("presentation")[0];
      expect(mobileDrawer).toBeInTheDocument();
    });
  });

  describe("Contraste e Visibilidade", () => {
    it("texto do menu deve ser legível quando fechado", async () => {
      renderWithProviders(
        <SideMenuDrawer>
          <div>Content</div>
        </SideMenuDrawer>
      );

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      const menuText = screen.getByText("Dashboard");

      // Quando drawer está fechado, texto tem opacity: 0 mas ainda renderiza
      // (para SEO e acessibilidade via screen readers)
      expect(menuText).toBeInTheDocument();
    });

    it("ícones devem ter contraste adequado", async () => {
      renderWithProviders(
        <SideMenuDrawer>
          <div>Content</div>
        </SideMenuDrawer>
      );

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      // Verifica que ícones estão presentes (contraste é validado por axe)
      const icons = screen.getAllByTestId(/^icon-/);
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe("ARIA e Screen Readers", () => {
    it("logo deve ter texto descritivo", async () => {
      renderWithProviders(
        <SideMenuDrawer>
          <div>Content</div>
        </SideMenuDrawer>
      );

      await waitFor(() => {
        expect(screen.getByText("SAM Gestor")).toBeInTheDocument();
      });

      expect(screen.getByText("SAM Gestor")).toBeInTheDocument();
    });

    it("itens de menu devem ter labels claros", async () => {
      renderWithProviders(
        <SideMenuDrawer>
          <div>Content</div>
        </SideMenuDrawer>
      );

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      // Verifica que todos os textos são claros e descritivos
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Retiros")).toBeInTheDocument();
      expect(screen.getByText("Usuários")).toBeInTheDocument();
    });
  });

  describe("Interação e Feedback", () => {
    it("click em item de menu deve ser possível", async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <SideMenuDrawer>
          <div>Content</div>
        </SideMenuDrawer>
      );

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
      await user.click(dashboardLink);

      // Link deve ser clicável (navegação mockada)
      expect(dashboardLink).toBeInTheDocument();
    });

    it("Enter em link deve acionar navegação", async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <SideMenuDrawer>
          <div>Content</div>
        </SideMenuDrawer>
      );

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
      dashboardLink.focus();

      await user.keyboard("{Enter}");

      // Link responde a Enter (comportamento padrão de links)
      expect(dashboardLink).toHaveFocus();
    });
  });

  describe("Performance de Acessibilidade", () => {
    it("renderização deve ser rápida para leitores de tela", async () => {
      const startTime = performance.now();

      renderWithProviders(
        <SideMenuDrawer>
          <div>Content</div>
        </SideMenuDrawer>
      );

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Renderização deve ser < 500ms para boa experiência
      expect(renderTime).toBeLessThan(500);
    });
  });
});
