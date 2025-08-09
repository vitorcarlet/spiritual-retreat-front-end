import { User } from "@/src/components/table/types";

export const mockUsers: User[] = [
  {
    id: 1,
    name: "Vitor Admin",
    email: "admin@email.com",
    role: "Admin",
    status: "active",
    createdAt: "2023-01-15",
    age: 21,
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@email.com",
    role: "Manager",
    status: "active",
    createdAt: "2023-02-20",
    age: 35,
  },
  {
    id: 3,
    name: "Pedro Costa",
    email: "pedro@email.com",
    role: "User",
    status: "inactive",
    createdAt: "2023-03-10",
    age: 24,
  },
  {
    id: 4,
    name: "Ana Oliveira",
    email: "ana@email.com",
    role: "Manager",
    status: "active",
    createdAt: "2023-04-05",
    age: 31,
  },
  {
    id: 5,
    name: "Carlos Pereira",
    email: "carlos@email.com",
    role: "User",
    status: "active",
    createdAt: "2023-05-12",
    age: 27,
  },
  // Adicionar mais dados para demonstrar a paginação
  ...Array.from({ length: 20 }, (_, i) => ({
    id: i + 6,
    name: `Usuário ${i + 6}`,
    email: `usuario${i + 6}@email.com`,
    role: ["Admin", "Manager", "User"][i % 3],
    status: ["active", "inactive"][i % 2] as "active" | "inactive",
    createdAt: `2023-${String((i % 12) + 1).padStart(2, "0")}-${String(
      (i % 28) + 1
    ).padStart(2, "0")}`,
    age: 20 + (i % 40),
  })),
];
