/**
 * Testes de Acessibilidade - Navegação e Landmarks
 *
 * Valida estrutura semântica, landmarks e navegação por região
 */

import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

// Mock do componente de Layout principal
const AppLayout = ({ children }: any) => {
  return (
    <div>
      <header role="banner">
        <nav aria-label="Navegação principal">
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/retreats">Retiros</a>
            </li>
            <li>
              <a href="/profile">Perfil</a>
            </li>
          </ul>
        </nav>
      </header>

      <main role="main" id="main-content" tabIndex={-1}>
        {children}
      </main>

      <aside role="complementary" aria-label="Informações adicionais">
        <h2>Avisos</h2>
        <p>Conteúdo complementar</p>
      </aside>

      <footer role="contentinfo">
        <p>&copy; 2024 Sistema de Retiros</p>
      </footer>
    </div>
  );
};

// Mock de Skip Link
const SkipLink = () => {
  return (
    <a
      href="#main-content"
      style={{
        position: "absolute",
        left: "-9999px",
        top: "0",
        zIndex: 9999,
      }}
      onFocus={(e) => {
        e.currentTarget.style.left = "0";
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = "-9999px";
      }}
    >
      Pular para conteúdo principal
    </a>
  );
};

describe("Acessibilidade - Navegação e Landmarks", () => {
  describe("WCAG 2.1 Compliance - Estrutura", () => {
    it("layout não deve ter violações de acessibilidade", async () => {
      const { container } = render(
        <AppLayout>
          <h1>Bem-vindo</h1>
          <p>Conteúdo da página</p>
        </AppLayout>
      );
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });
  });

  describe("Landmarks ARIA", () => {
    it("deve ter landmark banner (header)", () => {
      render(
        <AppLayout>
          <p>Content</p>
        </AppLayout>
      );

      const banner = screen.getByRole("banner");
      expect(banner).toBeInTheDocument();
    });

    it("deve ter landmark main (conteúdo principal)", () => {
      render(
        <AppLayout>
          <p>Content</p>
        </AppLayout>
      );

      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();
    });

    it("deve ter landmark complementary (sidebar)", () => {
      render(
        <AppLayout>
          <p>Content</p>
        </AppLayout>
      );

      const aside = screen.getByRole("complementary");
      expect(aside).toBeInTheDocument();
    });

    it("deve ter landmark contentinfo (footer)", () => {
      render(
        <AppLayout>
          <p>Content</p>
        </AppLayout>
      );

      const footer = screen.getByRole("contentinfo");
      expect(footer).toBeInTheDocument();
    });

    it("deve ter navigation landmark com label", () => {
      render(
        <AppLayout>
          <p>Content</p>
        </AppLayout>
      );

      const nav = screen.getByRole("navigation", {
        name: "Navegação principal",
      });
      expect(nav).toBeInTheDocument();
    });
  });

  describe("Skip Links", () => {
    it("deve ter link para pular para conteúdo principal", () => {
      render(
        <>
          <SkipLink />
          <AppLayout>
            <p>Content</p>
          </AppLayout>
        </>
      );

      const skipLink = screen.getByText("Pular para conteúdo principal");
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute("href", "#main-content");
    });

    it("skip link deve ficar visível ao receber foco", () => {
      render(<SkipLink />);

      const skipLink = screen.getByText(
        "Pular para conteúdo principal"
      ) as HTMLAnchorElement;

      // Estado inicial: fora da tela
      expect(skipLink.style.left).toBe("-9999px");

      // Ao receber foco: visível
      skipLink.focus();
      expect(skipLink.style.left).toBe("0px");
    });

    it("main deve ser focável via skip link", () => {
      render(
        <AppLayout>
          <p>Content</p>
        </AppLayout>
      );

      const main = screen.getByRole("main");
      expect(main).toHaveAttribute("id", "main-content");
      expect(main).toHaveAttribute("tabIndex", "-1");
    });
  });

  describe("Estrutura de Headings", () => {
    it("deve ter hierarquia correta de headings", () => {
      render(
        <AppLayout>
          <h1>Título Principal</h1>
          <section>
            <h2>Seção 1</h2>
            <h3>Subseção 1.1</h3>
          </section>
          <section>
            <h2>Seção 2</h2>
          </section>
        </AppLayout>
      );

      const h1 = screen.getByRole("heading", { level: 1 });
      const h2s = screen.getAllByRole("heading", { level: 2 });
      const h3 = screen.getByRole("heading", { level: 3 });

      expect(h1).toHaveTextContent("Título Principal");
      expect(h2s).toHaveLength(3); // "Avisos" + "Seção 1" + "Seção 2"
      expect(h3).toHaveTextContent("Subseção 1.1");
    });
  });

  describe("Navegação por Lista", () => {
    it("links de navegação devem estar em lista", () => {
      render(
        <AppLayout>
          <p>Content</p>
        </AppLayout>
      );

      const nav = screen.getByRole("navigation");
      const list = nav.querySelector("ul");
      const items = nav.querySelectorAll("li");

      expect(list).toBeInTheDocument();
      expect(items).toHaveLength(3);
    });

    it("cada item de navegação deve ser um link", () => {
      render(
        <AppLayout>
          <p>Content</p>
        </AppLayout>
      );

      const homeLink = screen.getByRole("link", { name: "Home" });
      const retreatsLink = screen.getByRole("link", { name: "Retiros" });
      const profileLink = screen.getByRole("link", { name: "Perfil" });

      expect(homeLink).toHaveAttribute("href", "/");
      expect(retreatsLink).toHaveAttribute("href", "/retreats");
      expect(profileLink).toHaveAttribute("href", "/profile");
    });
  });

  describe("Labels Descritivos", () => {
    it("navigation deve ter aria-label descritivo", () => {
      render(
        <AppLayout>
          <p>Content</p>
        </AppLayout>
      );

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveAttribute("aria-label", "Navegação principal");
    });

    it("aside deve ter aria-label descritivo", () => {
      render(
        <AppLayout>
          <p>Content</p>
        </AppLayout>
      );

      const aside = screen.getByRole("complementary");
      expect(aside).toHaveAttribute("aria-label", "Informações adicionais");
    });
  });

  describe("Foco e Navegação", () => {
    it("main deve aceitar foco programático para skip links", () => {
      render(
        <AppLayout>
          <p>Content</p>
        </AppLayout>
      );

      const main = screen.getByRole("main");
      main.focus();

      expect(main).toHaveFocus();
    });
  });

  describe("Múltiplas Navegações", () => {
    it("deve permitir múltiplas navegações com labels únicos", () => {
      const MultiNavLayout = () => (
        <div>
          <nav aria-label="Navegação principal">
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
            </ul>
          </nav>
          <nav aria-label="Navegação secundária">
            <ul>
              <li>
                <a href="/settings">Configurações</a>
              </li>
            </ul>
          </nav>
        </div>
      );

      render(<MultiNavLayout />);

      const primaryNav = screen.getByRole("navigation", {
        name: "Navegação principal",
      });
      const secondaryNav = screen.getByRole("navigation", {
        name: "Navegação secundária",
      });

      expect(primaryNav).toBeInTheDocument();
      expect(secondaryNav).toBeInTheDocument();
    });
  });

  describe("Breadcrumbs", () => {
    it("breadcrumbs devem usar nav com aria-label", () => {
      const Breadcrumbs = () => (
        <nav aria-label="Breadcrumb">
          <ol>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/retreats">Retiros</a>
            </li>
            <li aria-current="page">Detalhes</li>
          </ol>
        </nav>
      );

      render(<Breadcrumbs />);

      const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
      expect(breadcrumb).toBeInTheDocument();

      const currentPage = breadcrumb.querySelector('[aria-current="page"]');
      expect(currentPage).toHaveTextContent("Detalhes");
    });
  });
});
