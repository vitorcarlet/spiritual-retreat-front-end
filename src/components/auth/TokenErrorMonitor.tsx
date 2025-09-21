"use client";

import { useTokenErrorHandler } from "@/src/hooks/useTokenErrorHandler";

/**
 * Componente que monitora erros de token e redireciona automaticamente
 */
export default function TokenErrorMonitor() {
  useTokenErrorHandler();
  return null;
}
