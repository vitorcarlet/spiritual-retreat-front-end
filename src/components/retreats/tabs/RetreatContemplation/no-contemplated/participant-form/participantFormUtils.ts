import {
  ParticipantFormValues,
  ParticipantStatus,
} from "./participantFormSchema";

export const mapParticipantToFormValues = (
  p: Participant
): ParticipantFormValues => ({
  id: p.id,
  name: p.name ?? "",
  email: p.email ?? "",
  phone: p.phone ?? "",
  cpf: p.cpf ?? "",
  city: p.city ?? "",
  profession: p.personal?.profession ?? "",
  status: p.status,
  enabled: p.enabled ?? true,
  photoUrl: p.photoUrl ?? null,
});

export const getStatusColor = (
  status: ParticipantStatus
): "success" | "error" | "warning" | "info" | "default" => {
  const colors: Record<
    ParticipantStatus,
    "success" | "error" | "warning" | "info" | "default"
  > = {
    Selected: "info",
    NotSelected: "default",
    PendingPayment: "warning",
    PaymentConfirmed: "success",
    Confirmed: "success",
    Canceled: "error",
  };
  return colors[status] ?? "default";
};
