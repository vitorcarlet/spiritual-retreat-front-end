export type MockNotification = {
  id: number;
  title: string;
  description: string;
  date: string; // já formatado (ex.: "agora mesmo", "2 dias atrás")
  read: boolean;
  origin:
    | "payment_confirmed"
    | "participant_paid"
    | "family_filled"
    | "registration_completed"
    | string;
  retreatId: number;
};

let notificationSeq = 1000;
const nowLabel = () => "agora mesmo";

export const createByOrigin = (
  origin: MockNotification["origin"],
  retreatId: number
): MockNotification => {
  const id = ++notificationSeq;
  switch (origin) {
    case "payment_confirmed":
    case "participant_paid":
      return {
        id,
        title: "🎉 Participante realizou o pagamento!",
        description: "Pagamento confirmado com sucesso.",
        date: nowLabel(),
        read: false,
        origin,
        retreatId,
      };
    case "family_filled":
      return {
        id,
        title: "🎉 Família preenchida!",
        description: "Uma família foi totalmente preenchida com sucesso!",
        date: nowLabel(),
        read: false,
        origin,
        retreatId,
      };
    case "registration_completed":
      return {
        id,
        title: "📥 Inscrição concluída!",
        description: "Um participante finalizou sua inscrição.",
        date: nowLabel(),
        read: false,
        origin,
        retreatId,
      };
    default:
      return {
        id,
        title: "🔔 Nova notificação",
        description: "Você possui uma nova atualização.",
        date: nowLabel(),
        read: false,
        origin,
        retreatId,
      };
  }
};

export const mockNotifications: MockNotification[] = [
  {
    id: ++notificationSeq,
    title: "🎉 Família preenchida!",
    description: "Família Souza foi preenchida totalmente com sucesso!",
    date: "4 dias atrás",
    read: false,
    origin: "family_filled",
    retreatId: 1,
  },
  {
    id: ++notificationSeq,
    title: "🎉 Participante aceitou!",
    description:
      "Participante Carlos Souza aceitou o contemplamento com sucesso!",
    date: "2 dias atrás",
    read: false,
    origin: "registration_completed",
    retreatId: 1,
  },
  {
    id: ++notificationSeq,
    title: "🎉 Participante realizou o pagamento!",
    description: "Participante Carlos Souza pagou o retiro com sucesso!",
    date: "2 dias atrás",
    read: true,
    origin: "payment_confirmed",
    retreatId: 1,
  },
];
