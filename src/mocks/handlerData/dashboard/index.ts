export const mockRetreats: Retreat[] = [
  {
    id: 1,
    title: "Retiro de Verão 2025",
    description:
      "Um retiro especial de verão para renovação espiritual e convivência.",
    startDate: "2025-01-10",
    endDate: "2025-01-20",
    capacity: 50,
    enrolled: 45,
    location: "Sítio Esperança",
    isActive: false,
    image: "/images/retreats/retreat-1.jpg", // Substitua pelo caminho correto das imagens
    status: "open" as const,
  },
  {
    id: 2,
    title: "Retiro de Inverno 2025",
    description: "Vivencie momentos de paz e reflexão no retiro de inverno.",
    startDate: "2025-07-05",
    endDate: "2025-07-15",
    capacity: 60,
    enrolled: 58,
    location: "Chácara da Paz",
    isActive: true,
    image: "/images/retreats/retreat-2.jpg",
    status: "closed" as const,
  },
  {
    id: 3,
    title: "Retiro Jovem 2024",
    description:
      "Retiro voltado para jovens com atividades dinâmicas e espirituais.",
    startDate: "2024-09-01",
    endDate: "2024-09-10",
    capacity: 30,
    enrolled: 30,
    location: "Fazenda Luz",
    isActive: false,
    image: "/images/retreats/retreat-3.jpg",
    status: "running" as const,
  },
];

// Mock de métricas por retiro
export const mockMetrics: Record<string, unknown> = {
  "1": {
    payments: { pending: 5, confirmed: 45, total: 50 },
    families: { formed: 12, total: 15 },
    accommodations: { occupied: 30, total: 35 },
    teams: { complete: 4, total: 5 },
    messages: { sent: 120 },
    criticalIssues: {
      count: 2,
      items: [
        {
          id: "c1",
          description: "2 pagamentos pendentes há mais de 7 dias",
          type: "payment",
        },
        {
          id: "c2",
          description: "Equipe de cozinha incompleta",
          type: "team",
        },
      ],
    },
  },
  "2": {
    payments: { pending: 2, confirmed: 58, total: 60 },
    families: { formed: 14, total: 14 },
    accommodations: { occupied: 34, total: 34 },
    teams: { complete: 5, total: 5 },
    messages: { sent: 200 },
    criticalIssues: {
      count: 1,
      items: [
        {
          id: "c3",
          description: "1 barraca com problema de vazamento",
          type: "accommodation",
        },
      ],
    },
  },
  "3": {
    payments: { pending: 0, confirmed: 30, total: 30 },
    families: { formed: 8, total: 8 },
    accommodations: { occupied: 20, total: 20 },
    teams: { complete: 3, total: 3 },
    messages: { sent: 80 },
    criticalIssues: {
      count: 0,
      items: [],
    },
  },
};
