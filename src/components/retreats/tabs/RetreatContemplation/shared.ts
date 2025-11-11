import { RegistrationDTO } from "./types";

export const mapRegistrationToParticipant = (
  registration: RegistrationDTO
): ContemplatedParticipant => {
  return {
    id: registration.id,
    name: registration.name || "Participante sem nome",
    email: "", // Campo não disponível no DTO
    phone: undefined,
    cpf: registration.cpf,
    region: registration.region,
    status: "not_contemplated", // Já filtrado na API (NotSelected + Guest)
    photoUrl: registration.photoUrl,
    activity: "Participante",
    paymentStatus: "pending",
    participation: false,
  };
};

export const DEFAULT_FILTERS = {
  page: 1,
  pageLimit: 10,
};

export const extractRegistrations = (
  payload: Record<string, unknown>
): RegistrationDTO[] => {
  if (Array.isArray(payload.items)) return payload.items as RegistrationDTO[];
  if (Array.isArray(payload.data)) return payload.data as RegistrationDTO[];
  if (Array.isArray(payload.rows)) return payload.rows as RegistrationDTO[];
  if (Array.isArray(payload.result)) return payload.result as RegistrationDTO[];
  if (Array.isArray(payload.registrations))
    return payload.registrations as RegistrationDTO[];
  return [];
};

export const extractTotal = (
  payload: Record<string, unknown>,
  fallback: number
): number => {
  if (typeof payload.totalCount === "number") return payload.totalCount;
  if (typeof payload.total === "number") return payload.total;
  if (typeof payload.count === "number") return payload.count;
  if (payload.meta && typeof payload.meta === "object") {
    const meta = payload.meta as Record<string, unknown>;
    if (typeof meta.totalItems === "number") {
      return meta.totalItems;
    }
    if (typeof meta.itemCount === "number") {
      return meta.itemCount;
    }
  }
  return fallback;
};

export const getInitials = (name?: string) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

export const formatDateToBR = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};
