/* eslint-disable no-console */
/**
 * Testes de Contraste de Cores (WCAG AA/AAA)
 *
 * Valida que cores atendem requisitos mínimos de contraste
 * WCAG AA: 4.5:1 para texto normal, 3:1 para texto grande
 * WCAG AAA: 7:1 para texto normal, 4.5:1 para texto grande
 */

import React from "react";
import { render } from "@testing-library/react";
import { COMMON, GREY } from "@/src/theme/core/palette";

// ============================================================================
// CORES DO TEMA REAL
// ============================================================================

// Light Mode
const LIGHT_THEME = {
  text: {
    primary: GREY[900], // "#161B22"
    secondary: "#797d8fff",
    disabled: GREY[500], // "#6E7681"
    menu: "#797d8fff",
  },
  background: {
    paper: GREY[0], // "#FFFFFF"
    default: "#EBEBEB",
    active: "#DFE1EA",
  },
  warning: {
    main: "#f1ba23ff",
    contrastText: GREY[800], // "#21262D"
  },
};

// Dark Mode
const DARK_THEME = {
  text: {
    primary: "#C9D1D9",
    secondary: GREY[0], // "#FFFFFF"
    disabled: GREY[600], // "#484F58"
    menu: "#797d8fff",
  },
  background: {
    paper: GREY[900], // "#161B22"
    default: GREY[1000], // "#0D1117"
    active: "#DFE1EA",
  },
  success: {
    main: "#D6FBE9",
    contrastText: GREY[100], // "#F0F6FC"
  },
};

// Cores compartilhadas (COMMON)
const SHARED_COLORS = {
  primary: COMMON.primary,
  secondary: COMMON.secondary,
  info: COMMON.info,
  success: COMMON.success,
  warning: COMMON.warning,
  error: COMMON.error,
};

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
type ButtonVariant = "primary" | "secondary" | "outlined";

const Button = ({
  children,
  variant = "primary",
}: {
  children: any;
  variant?: ButtonVariant;
}) => {
  const styles: Record<
    ButtonVariant,
    { backgroundColor: string; color: string; border?: string }
  > = {
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
const Alert = ({
  children,
  severity = "info",
}: {
  children: React.ReactNode;
  severity?: "error" | "warning" | "info" | "success";
}) => {
  const styles: Record<
    "error" | "warning" | "info" | "success",
    { backgroundColor: string; color: string }
  > = {
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
  // ============================================================================
  // TESTES COM CORES REAIS DO TEMA - LIGHT MODE
  // ============================================================================
  describe("Light Mode - Cores do Tema Real", () => {
    describe("Texto sobre fundos", () => {
      it("text.primary sobre background.paper deve ter contraste ≥ 4.5:1", () => {
        const ratio = getContrastRatio(
          LIGHT_THEME.text.primary,
          LIGHT_THEME.background.paper
        );
        console.log(
          `Light: text.primary (${LIGHT_THEME.text.primary}) sobre paper (${LIGHT_THEME.background.paper}): ${ratio.toFixed(2)}:1`
        );
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });

      it("text.primary sobre background.default deve ter contraste ≥ 4.5:1", () => {
        const ratio = getContrastRatio(
          LIGHT_THEME.text.primary,
          LIGHT_THEME.background.default
        );
        console.log(`Light: text.primary sobre default: ${ratio.toFixed(2)}:1`);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });

      it("text.secondary sobre background.paper deve ter contraste ≥ 4.5:1", () => {
        // Nota: cores com 8 caracteres hex têm alfa, vamos usar apenas os 6 primeiros
        const secondaryColor = LIGHT_THEME.text.secondary.substring(0, 7);
        const ratio = getContrastRatio(
          secondaryColor,
          LIGHT_THEME.background.paper
        );
        console.log(
          `Light: text.secondary (${secondaryColor}) sobre paper: ${ratio.toFixed(2)}:1`
        );
        // Este teste pode falhar - documenta problema de acessibilidade
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });

      it("text.disabled sobre background.paper deve ter contraste ≥ 3:1 (texto grande)", () => {
        const ratio = getContrastRatio(
          LIGHT_THEME.text.disabled,
          LIGHT_THEME.background.paper
        );
        console.log(`Light: text.disabled sobre paper: ${ratio.toFixed(2)}:1`);
        // Texto desabilitado pode ter contraste menor (3:1 para texto grande)
        expect(ratio).toBeGreaterThanOrEqual(3.0);
      });
    });

    describe("Cores de alerta", () => {
      it("error.main com contrastText deve ter contraste ≥ 4.5:1", () => {
        const ratio = getContrastRatio(
          SHARED_COLORS.error.main,
          SHARED_COLORS.error.contrastText
        );
        console.log(
          `Error: ${SHARED_COLORS.error.main} com ${SHARED_COLORS.error.contrastText}: ${ratio.toFixed(2)}:1`
        );
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });

      it("warning.main com contrastText deve ter contraste ≥ 4.5:1", () => {
        const ratio = getContrastRatio(
          SHARED_COLORS.warning.main,
          SHARED_COLORS.warning.contrastText
        );
        console.log(
          `Warning: ${SHARED_COLORS.warning.main} com ${SHARED_COLORS.warning.contrastText}: ${ratio.toFixed(2)}:1`
        );
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });

      it("info.main com contrastText deve ter contraste ≥ 4.5:1", () => {
        const ratio = getContrastRatio(
          SHARED_COLORS.info.main,
          SHARED_COLORS.info.contrastText
        );
        console.log(
          `Info: ${SHARED_COLORS.info.main} com ${SHARED_COLORS.info.contrastText}: ${ratio.toFixed(2)}:1`
        );
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });

      it("success.main com contrastText deve ter contraste ≥ 4.5:1", () => {
        const ratio = getContrastRatio(
          SHARED_COLORS.success.main,
          SHARED_COLORS.success.contrastText
        );
        console.log(
          `Success: ${SHARED_COLORS.success.main} com ${SHARED_COLORS.success.contrastText}: ${ratio.toFixed(2)}:1`
        );
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    });

    describe("Botões", () => {
      it("primary.main com contrastText deve ter contraste ≥ 4.5:1", () => {
        const ratio = getContrastRatio(
          SHARED_COLORS.primary.main,
          SHARED_COLORS.primary.contrastText
        );
        console.log(
          `Primary button: ${SHARED_COLORS.primary.main} com ${SHARED_COLORS.primary.contrastText}: ${ratio.toFixed(2)}:1`
        );
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });

      it("secondary.main com contrastText deve ter contraste ≥ 4.5:1", () => {
        const ratio = getContrastRatio(
          SHARED_COLORS.secondary.main,
          SHARED_COLORS.secondary.contrastText
        );
        console.log(
          `Secondary button: ${SHARED_COLORS.secondary.main} com ${SHARED_COLORS.secondary.contrastText}: ${ratio.toFixed(2)}:1`
        );
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    });
  });

  // ============================================================================
  // TESTES COM CORES REAIS DO TEMA - DARK MODE
  // ============================================================================
  describe("Dark Mode - Cores do Tema Real", () => {
    describe("Texto sobre fundos", () => {
      it("text.primary sobre background.paper deve ter contraste ≥ 4.5:1", () => {
        const ratio = getContrastRatio(
          DARK_THEME.text.primary,
          DARK_THEME.background.paper
        );
        console.log(
          `Dark: text.primary (${DARK_THEME.text.primary}) sobre paper (${DARK_THEME.background.paper}): ${ratio.toFixed(2)}:1`
        );
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });

      it("text.primary sobre background.default deve ter contraste ≥ 4.5:1", () => {
        const ratio = getContrastRatio(
          DARK_THEME.text.primary,
          DARK_THEME.background.default
        );
        console.log(`Dark: text.primary sobre default: ${ratio.toFixed(2)}:1`);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });

      it("text.secondary sobre background.paper deve ter contraste ≥ 4.5:1", () => {
        const ratio = getContrastRatio(
          DARK_THEME.text.secondary,
          DARK_THEME.background.paper
        );
        console.log(`Dark: text.secondary sobre paper: ${ratio.toFixed(2)}:1`);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });

      it("text.menu sobre background.paper deve ter contraste ≥ 3:1", () => {
        const menuColor = DARK_THEME.text.menu.substring(0, 7);
        const ratio = getContrastRatio(menuColor, DARK_THEME.background.paper);
        console.log(`Dark: text.menu sobre paper: ${ratio.toFixed(2)}:1`);
        expect(ratio).toBeGreaterThanOrEqual(3.0);
      });
    });
  });

  // ============================================================================
  // RELATÓRIO COMPLETO DE TODAS AS CORES
  // ============================================================================
  describe("Relatório Completo de Contraste", () => {
    it("deve gerar relatório de todas as combinações de cores do tema", () => {
      const combinations = [
        // Light Mode - Texto
        {
          name: "Light: text.primary / paper",
          fg: LIGHT_THEME.text.primary,
          bg: LIGHT_THEME.background.paper,
        },
        {
          name: "Light: text.primary / default",
          fg: LIGHT_THEME.text.primary,
          bg: LIGHT_THEME.background.default,
        },
        {
          name: "Light: text.secondary / paper",
          fg: LIGHT_THEME.text.secondary.substring(0, 7),
          bg: LIGHT_THEME.background.paper,
        },
        {
          name: "Light: text.disabled / paper",
          fg: LIGHT_THEME.text.disabled,
          bg: LIGHT_THEME.background.paper,
        },
        // Dark Mode - Texto
        {
          name: "Dark: text.primary / paper",
          fg: DARK_THEME.text.primary,
          bg: DARK_THEME.background.paper,
        },
        {
          name: "Dark: text.primary / default",
          fg: DARK_THEME.text.primary,
          bg: DARK_THEME.background.default,
        },
        {
          name: "Dark: text.secondary / paper",
          fg: DARK_THEME.text.secondary,
          bg: DARK_THEME.background.paper,
        },
        // Cores compartilhadas
        {
          name: "Primary button",
          fg: SHARED_COLORS.primary.contrastText,
          bg: SHARED_COLORS.primary.main,
        },
        {
          name: "Secondary button",
          fg: SHARED_COLORS.secondary.contrastText,
          bg: SHARED_COLORS.secondary.main,
        },
        {
          name: "Error alert",
          fg: SHARED_COLORS.error.contrastText,
          bg: SHARED_COLORS.error.main,
        },
        {
          name: "Warning alert",
          fg: SHARED_COLORS.warning.contrastText,
          bg: SHARED_COLORS.warning.main,
        },
        {
          name: "Info alert",
          fg: SHARED_COLORS.info.contrastText,
          bg: SHARED_COLORS.info.main,
        },
        {
          name: "Success alert",
          fg: SHARED_COLORS.success.contrastText,
          bg: SHARED_COLORS.success.main,
        },
      ];

      console.log("\n========================================");
      console.log("RELATÓRIO DE CONTRASTE DE CORES DO TEMA");
      console.log("========================================\n");

      const results: { name: string; ratio: number; status: string }[] = [];

      combinations.forEach(({ name, fg, bg }) => {
        const ratio = getContrastRatio(fg, bg);
        let status = "❌ FALHA";
        if (ratio >= 7) {
          status = "✅ AAA (7:1+)";
        } else if (ratio >= 4.5) {
          status = "✅ AA (4.5:1+)";
        } else if (ratio >= 3) {
          status = "⚠️ Texto Grande (3:1+)";
        }

        results.push({ name, ratio, status });
        console.log(`${status} ${name}: ${ratio.toFixed(2)}:1`);
        console.log(`   Foreground: ${fg} | Background: ${bg}`);
      });

      console.log("\n========================================");
      console.log("RESUMO:");
      console.log(
        `  Passam AAA: ${results.filter((r) => r.ratio >= 7).length}`
      );
      console.log(
        `  Passam AA: ${results.filter((r) => r.ratio >= 4.5 && r.ratio < 7).length}`
      );
      console.log(
        `  Apenas texto grande: ${results.filter((r) => r.ratio >= 3 && r.ratio < 4.5).length}`
      );
      console.log(`  Falham: ${results.filter((r) => r.ratio < 3).length}`);
      console.log("========================================\n");

      // Este teste não falha, apenas documenta
      expect(true).toBe(true);
    });
  });

  // ============================================================================
  // TESTES ORIGINAIS COM MOCKS (mantidos para referência)
  // ============================================================================
  describe("WCAG AA - Botões Primários (Mocks)", () => {
    it("botão primary deve ter contraste ≥ 4.5:1 (AA)", () => {
      render(<Button variant="primary">Entrar</Button>);

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
