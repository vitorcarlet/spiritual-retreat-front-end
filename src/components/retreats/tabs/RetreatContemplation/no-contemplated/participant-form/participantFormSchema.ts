import { z } from "zod";

const dataUrlRegex = /^data:image\/[a-zA-Z]+;base64,/;

/* Status do participante conforme API */
export const PARTICIPANT_STATUS = {
  Selected: "Selecionado",
  NotSelected: "Não Selecionado",
  PendingPayment: "Pagamento Pendente",
  PaymentConfirmed: "Pagamento Confirmado",
  Confirmed: "Confirmado",
  Canceled: "Cancelado",
} as const;

export type ParticipantStatus = keyof typeof PARTICIPANT_STATUS;

/* Zod schema para edição básica */
export const participantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nome muito curto").max(120, "Nome muito longo"),
  email: z.string().email("Email inválido"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^[+0-9 ()-]{8,20}$/.test(v),
      "Formato de telefone inválido"
    ),
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  city: z.string().optional(),
  profession: z.string().optional(),
  status: z.enum([
    "Selected",
    "NotSelected",
    "PendingPayment",
    "PaymentConfirmed",
    "Confirmed",
    "Canceled",
  ]),
  enabled: z.boolean(),
  photoUrl: z
    .union([
      z.string().url("URL inválida"),
      z.string().regex(dataUrlRegex, "Imagem inválida"),
    ])
    .optional()
    .or(z.literal("").transform(() => undefined))
    .or(z.null()),
});

export type ParticipantFormValues = z.infer<typeof participantSchema>;

export const defaultEmpty: ParticipantFormValues = {
  name: "",
  email: "",
  phone: "",
  cpf: "",
  city: "",
  profession: "",
  status: "NotSelected",
  enabled: true,
  photoUrl: null,
};
