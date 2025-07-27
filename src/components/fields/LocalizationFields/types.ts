// Tipos para localização (Estados e Cidades do Brasil)

export interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

export interface Cidade {
  id: number;
  nome: string;
}

export interface LocalizationData {
  estado: string;
  cidade: string;
}

export interface StateFieldProps {
  selectedState?: string;
  selectedCity?: string;
  onStateChange?: (state: string) => void;
  onCityChange?: (city: string) => void;
  disabled?: boolean;
  required?: boolean;
  size?: "small" | "medium";
  variant?: "outlined" | "filled" | "standard";
  error?: boolean;
  helperText?: string;
}

// Estados mais populosos do Brasil (fallback caso API falhe)
export const FALLBACK_STATES: Estado[] = [
  { id: 35, sigla: "SP", nome: "São Paulo" },
  { id: 33, sigla: "RJ", nome: "Rio de Janeiro" },
  { id: 31, sigla: "MG", nome: "Minas Gerais" },
  { id: 41, sigla: "PR", nome: "Paraná" },
  { id: 42, sigla: "SC", nome: "Santa Catarina" },
  { id: 43, sigla: "RS", nome: "Rio Grande do Sul" },
  { id: 23, sigla: "CE", nome: "Ceará" },
  { id: 29, sigla: "BA", nome: "Bahia" },
  { id: 26, sigla: "PE", nome: "Pernambuco" },
  { id: 52, sigla: "GO", nome: "Goiás" },
  { id: 32, sigla: "ES", nome: "Espírito Santo" },
  { id: 24, sigla: "RN", nome: "Rio Grande do Norte" },
  { id: 25, sigla: "PB", nome: "Paraíba" },
  { id: 27, sigla: "AL", nome: "Alagoas" },
  { id: 28, sigla: "SE", nome: "Sergipe" },
  { id: 21, sigla: "MA", nome: "Maranhão" },
  { id: 22, sigla: "PI", nome: "Piauí" },
  { id: 51, sigla: "MT", nome: "Mato Grosso" },
  { id: 50, sigla: "MS", nome: "Mato Grosso do Sul" },
  { id: 53, sigla: "DF", nome: "Distrito Federal" },
  { id: 11, sigla: "RO", nome: "Rondônia" },
  { id: 12, sigla: "AC", nome: "Acre" },
  { id: 13, sigla: "AM", nome: "Amazonas" },
  { id: 14, sigla: "RR", nome: "Roraima" },
  { id: 15, sigla: "PA", nome: "Pará" },
  { id: 16, sigla: "AP", nome: "Amapá" },
  { id: 17, sigla: "TO", nome: "Tocantins" },
];
