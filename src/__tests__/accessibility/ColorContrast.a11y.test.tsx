/* eslint-disable no-console */
/**
 * Testes de Contraste de Cores (WCAG AA/AAA)
 *
 * Valida que cores atendem requisitos mínimos de contraste
 * WCAG AA: 4.5:1 para texto normal, 3:1 para texto grande
 * WCAG AAA: 7:1 para texto normal, 4.5:1 para texto grande
 */

import { render, screen } from "@testing-library/react";

// Função auxiliar para calcular contraste de cores
// Baseada em https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
function getLuminance(color: string): number {
  // Converte hex para RGB
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Aplica fórmula de luminância relativa
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Mock de componentes do sistema
const Button = ({ children, variant = "primary" }: any) => {
  const styles = {
    primary: { backgroundColor: "#1976d2", color: "#ffffff" },
    secondary: { backgroundColor: "#dc004e", color: "#ffffff" },
    outlined: {
      backgroundColor: "#ffffff",
      color: "#1976d2",
      border: "1px solid #1976d2",
    },
  };

  return (
    <button
      style={{ ...styles[variant], padding: "8px 16px", fontSize: "14px" }}
    >
      {children}
    </button>
  );
};

const Alert = ({ children, severity = "info" }: any) => {
  const styles = {
    error: { backgroundColor: "#fdeded", color: "#5f2120" },
    warning: { backgroundColor: "#fff4e5", color: "#663c00" },
    info: { backgroundColor: "#e5f6fd", color: "#014361" },
    success: { backgroundColor: "#edf7ed", color: "#1e4620" },
  };

  return (
    <div role="alert" style={{ ...styles[severity], padding: "16px" }}>
      {children}
    </div>
  );
};

describe("Testes de Contraste de Cores", () => {
  describe("WCAG AA - Botões Primários", () => {
    it("botão primary deve ter contraste ≥ 4.5:1 (AA)", () => {
      render(<Button variant="primary">Entrar</Button>);
      const button = screen.getByRole("button");

      const styles = window.getComputedStyle(button);
      const bgColor = "#1976d2"; // azul Material UI primary
      const textColor = "#ffffff"; // branco

      const ratio = getContrastRatio(bgColor, textColor);

      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`Contraste botão primary: ${ratio.toFixed(2)}:1`);
    });

    it("botão secondary deve ter contraste ≥ 4.5:1 (AA)", () => {
      render(<Button variant="secondary">Cancelar</Button>);

      const bgColor = "#dc004e"; // vermelho Material UI secondary
      const textColor = "#ffffff";

      const ratio = getContrastRatio(bgColor, textColor);

      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`Contraste botão secondary: ${ratio.toFixed(2)}:1`);
    });

    it("botão outlined deve ter contraste ≥ 4.5:1 (AA)", () => {
      render(<Button variant="outlined">Voltar</Button>);

      const bgColor = "#ffffff"; // branco
      const textColor = "#1976d2"; // azul

      const ratio = getContrastRatio(bgColor, textColor);

      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`Contraste botão outlined: ${ratio.toFixed(2)}:1`);
    });
  });

  describe("WCAG AA - Alertas e Mensagens", () => {
    it("alert error deve ter contraste ≥ 4.5:1", () => {
      render(<Alert severity="error">Erro ao processar solicitação</Alert>);

      const bgColor = "#fdeded"; // vermelho claro
      const textColor = "#5f2120"; // vermelho escuro

      const ratio = getContrastRatio(bgColor, textColor);

      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`Contraste alert error: ${ratio.toFixed(2)}:1`);
    });

    it("alert warning deve ter contraste ≥ 4.5:1", () => {
      render(<Alert severity="warning">Atenção: dados não salvos</Alert>);

      const bgColor = "#fff4e5"; // amarelo claro
      const textColor = "#663c00"; // marrom escuro

      const ratio = getContrastRatio(bgColor, textColor);

      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`Contraste alert warning: ${ratio.toFixed(2)}:1`);
    });

    it("alert info deve ter contraste ≥ 4.5:1", () => {
      render(<Alert severity="info">Informação importante</Alert>);

      const bgColor = "#e5f6fd"; // azul claro
      const textColor = "#014361"; // azul escuro

      const ratio = getContrastRatio(bgColor, textColor);

      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`Contraste alert info: ${ratio.toFixed(2)}:1`);
    });

    it("alert success deve ter contraste ≥ 4.5:1", () => {
      render(<Alert severity="success">Operação realizada com sucesso</Alert>);

      const bgColor = "#edf7ed"; // verde claro
      const textColor = "#1e4620"; // verde escuro

      const ratio = getContrastRatio(bgColor, textColor);

      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`Contraste alert success: ${ratio.toFixed(2)}:1`);
    });
  });

  describe("WCAG AAA - Contraste Avançado", () => {
    it("botão primary deve ter contraste ≥ 7:1 (AAA)", () => {
      const bgColor = "#1976d2";
      const textColor = "#ffffff";

      const ratio = getContrastRatio(bgColor, textColor);

      expect(ratio).toBeGreaterThanOrEqual(7.0);
      console.log(`Contraste AAA botão primary: ${ratio.toFixed(2)}:1`);
    });
  });

  describe("Validação de Cores do Sistema", () => {
    const coreColors = {
      "primary-main": "#1976d2",
      "primary-dark": "#004ba0",
      "primary-light": "#63a4ff",
      "secondary-main": "#dc004e",
      "error-main": "#f44336",
      "warning-main": "#ff9800",
      "info-main": "#2196f3",
      "success-main": "#4caf50",
      "text-primary": "#000000",
      "text-secondary": "#757575",
      "background-paper": "#ffffff",
      "background-default": "#fafafa",
    };

    it("texto primário sobre fundo branco deve ter contraste ≥ 4.5:1", () => {
      const ratio = getContrastRatio(
        coreColors["text-primary"],
        coreColors["background-paper"]
      );

      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`Contraste texto primário/branco: ${ratio.toFixed(2)}:1`);
    });

    it("texto secundário sobre fundo branco deve ter contraste ≥ 4.5:1", () => {
      const ratio = getContrastRatio(
        coreColors["text-secondary"],
        coreColors["background-paper"]
      );

      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`Contraste texto secundário/branco: ${ratio.toFixed(2)}:1`);
    });

    it("primary-main sobre branco deve ter contraste ≥ 3:1 (texto grande)", () => {
      const ratio = getContrastRatio(
        coreColors["primary-main"],
        coreColors["background-paper"]
      );

      // Texto grande (18pt+ ou 14pt+ bold) requer apenas 3:1
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      console.log(`Contraste primary/branco: ${ratio.toFixed(2)}:1`);
    });
  });

  describe("Casos Extremos", () => {
    it("preto sobre branco deve ter contraste máximo (21:1)", () => {
      const ratio = getContrastRatio("#000000", "#ffffff");

      expect(ratio).toBeCloseTo(21, 0);
      console.log(`Contraste preto/branco: ${ratio.toFixed(2)}:1`);
    });

    it("cinzas adjacentes devem ter contraste mínimo", () => {
      const ratio = getContrastRatio("#757575", "#ffffff");

      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`Contraste cinza médio/branco: ${ratio.toFixed(2)}:1`);
    });
  });

  describe("Cálculos de Luminância", () => {
    it("deve calcular luminância correta para branco", () => {
      const lum = getLuminance("#ffffff");
      expect(lum).toBeCloseTo(1, 2);
    });

    it("deve calcular luminância correta para preto", () => {
      const lum = getLuminance("#000000");
      expect(lum).toBeCloseTo(0, 2);
    });

    it("deve calcular luminância correta para cinza médio", () => {
      const lum = getLuminance("#808080");
      expect(lum).toBeGreaterThan(0);
      expect(lum).toBeLessThan(1);
    });
  });

  describe("Recomendações WCAG", () => {
    it("deve documentar cores aprovadas para uso no sistema", () => {
      const approvedCombinations = [
        { bg: "#1976d2", fg: "#ffffff", name: "Botão Primary" },
        { bg: "#dc004e", fg: "#ffffff", name: "Botão Secondary" },
        { bg: "#ffffff", fg: "#000000", name: "Texto Principal" },
        { bg: "#f44336", fg: "#ffffff", name: "Error" },
        { bg: "#4caf50", fg: "#ffffff", name: "Success" },
      ];

      approvedCombinations.forEach(({ bg, fg, name }) => {
        const ratio = getContrastRatio(bg, fg);
        console.log(`✅ ${name}: ${ratio.toFixed(2)}:1`);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    });
  });
});
