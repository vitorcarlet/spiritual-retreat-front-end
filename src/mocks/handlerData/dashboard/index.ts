export const mockRetreats = [
  {
    id: "1",
    name: "Retiro de Verão 2025",
    startDate: "2025-01-10",
    endDate: "2025-01-20",
    location: "Sítio Esperança",
    isActive: false,
  },
  {
    id: "2",
    name: "Retiro de Inverno 2025",
    startDate: "2025-07-05",
    endDate: "2025-07-15",
    location: "Chácara da Paz",
    isActive: true,
  },
  {
    id: "3",
    name: "Retiro Jovem 2024",
    startDate: "2024-09-01",
    endDate: "2024-09-10",
    location: "Fazenda Luz",
    isActive: false,
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
