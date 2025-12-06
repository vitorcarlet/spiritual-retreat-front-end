/**
 * Loading Component - Testes Unitários
 *
 * Validação:
 * - Renderização do componente Loading
 * - Exibição do SplashScreen
 */

import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock do framer-motion para evitar problemas com animações
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock do LogoRectangle
jest.mock("@/src/components/loading-screen/LogoRectangle", () => ({
  LogoRectangle: () => <div data-testid="logo-rectangle">Logo</div>,
}));

// Mock do MUI Box
jest.mock("@mui/material/Box", () => {
  const MockBox = ({
    children,
    component,
    ...props
  }: React.PropsWithChildren<{ component?: React.ElementType }>) => {
    const Component = component || "div";
    return (
      <Component data-testid="mui-box" {...props}>
        {children}
      </Component>
    );
  };
  MockBox.displayName = "MockBox";
  return MockBox;
});

// Mock do alpha do MUI
jest.mock("@mui/material", () => ({
  alpha: (color: string, opacity: number) => `rgba(0,0,0,${opacity})`,
}));

// Importar o componente após os mocks
import Loading from "@/app/loading";

describe("Loading Component", () => {
  it("deve renderizar o componente Loading sem erros", () => {
    const { container } = render(<Loading />);
    expect(container).toBeInTheDocument();
  });

  it("deve renderizar o SplashScreen com múltiplos Box", () => {
    const { getAllByTestId } = render(<Loading />);
    // O SplashScreen tem múltiplos Box (container + 2 animações)
    const boxes = getAllByTestId("mui-box");
    expect(boxes.length).toBeGreaterThanOrEqual(1);
  });

  it("deve renderizar o LogoRectangle dentro do SplashScreen", () => {
    const { getByTestId } = render(<Loading />);
    expect(getByTestId("logo-rectangle")).toBeInTheDocument();
  });

  it("deve renderizar elementos de animação", () => {
    const { getAllByTestId } = render(<Loading />);
    // Deve ter pelo menos um motion.div para a animação
    const motionDivs = getAllByTestId("motion-div");
    expect(motionDivs.length).toBeGreaterThan(0);
  });
});
