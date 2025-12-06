import { render, screen, cleanup } from "@testing-library/react";
import RootLayout, { metadata } from "@/app/layout";
import { getLocale } from "next-intl/server";
import { auth } from "@/auth";

jest.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="next-intl-client-provider">{children}</div>
  ),
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({ dateTime: () => "mock-date" }),
}));

jest.mock("@/src/providers/ThemeMuiProvider", () => {
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-mui-provider">{children}</div>
  );
});

// --- Mocks Essenciais (Coloque eles no início do arquivo de teste) ---
// Mocks para Next.js e Providers de alto nível
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("next-intl/server", () => ({
  getLocale: jest.fn(),
}));

// Mock para AppRouterCacheProvider (MUI)
jest.mock("@mui/material-nextjs/v15-appRouter", () => ({
  AppRouterCacheProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-router-cache-provider">{children}</div>
  ),
}));

// Mock para SessionProvider (NextAuth)
jest.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}));

// Mock para o poppins font
jest.mock("next/font/google", () => ({
  Poppins: () => ({ className: "poppins-font-class" }),
}));

// Mock para InitColorSchemeScript
jest.mock("@mui/material/InitColorSchemeScript", () => ({
  __esModule: true,
  default: () => null,
}));

describe("RootLayout Server Component", () => {
  // Configuração padrão de mocks antes de cada teste
  beforeEach(() => {
    (auth as jest.Mock).mockResolvedValue(null); // Mocka a sessão como nula
    (getLocale as jest.Mock).mockResolvedValue("pt-BR"); // Mocka o locale padrão
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it("deve renderizar o layout com o locale e children corretos", async () => {
    const TestChildren = () => (
      <div data-testid="test-children">Hello World</div>
    );

    // Renderiza o Server Component (usando await para resolver a promessa)
    const Component = await RootLayout({ children: <TestChildren /> });

    // Renderiza o resultado do Server Component usando o render do RTL
    render(Component);

    // 1. Verifica se o componente filho foi renderizado
    expect(screen.getByTestId("test-children")).toBeInTheDocument();

    // 2. Verifica se as classes de fonte foram aplicadas (mockadas)
    expect(document.body).toHaveClass("poppins-font-class");

    // 3. Verifica se as funções do servidor foram chamadas
    expect(auth).toHaveBeenCalled();
    expect(getLocale).toHaveBeenCalled();
  });

  it("deve renderizar os providers corretamente", async () => {
    const Component = await RootLayout({
      children: <div data-testid="child" />,
    });
    render(Component);

    // Verifica se os providers mockados estão presentes
    expect(screen.getByTestId("session-provider")).toBeInTheDocument();
    expect(screen.getByTestId("app-router-cache-provider")).toBeInTheDocument();
    expect(screen.getByTestId("theme-mui-provider")).toBeInTheDocument();
    expect(screen.getByTestId("next-intl-client-provider")).toBeInTheDocument();
  });

  it("deve usar o locale de fallback 'pt-BR' se getLocale() retornar null", async () => {
    (getLocale as jest.Mock).mockResolvedValue(null);

    const Component = await RootLayout({
      children: <div data-testid="fallback-child" />,
    });
    render(Component);

    // Verifica que o componente renderizou mesmo com locale null
    expect(screen.getByTestId("fallback-child")).toBeInTheDocument();
    expect(getLocale).toHaveBeenCalled();
  });

  // Teste para a função metadata
  it("deve retornar o objeto de metadata correto", async () => {
    const result = await metadata();
    expect(result.title).toBe("SAM Gestor");
    expect(result.description).toBe(
      "Plataforma de gestão de retiros espirituais"
    );
  });
});
