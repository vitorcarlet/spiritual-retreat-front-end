import { UserObject } from "next-auth";

// ✅ Mock data com nova estrutura
export const createUserMock = (
  roleType: "admin" | "manager" | "consultant" | "user"
): UserObject => {
  const baseUser = {
    id: 1,
    email: "admin@email.com",
    name: "Vitor Admin",
    first_name: "Vitor",
    last_name: "Admin",
  };

  // Definir roles baseado no tipo
  const roles = {
    admin: roleType === "admin",
    manager: roleType === "manager",
    consultant: roleType === "consultant",
    user: true, // Todos têm role user
  };

  // Definir permissions baseado no role
  const permissions = {
    create: {
      users: roleType === "admin",
      settings: roleType === "admin" || roleType === "manager",
      retreats: roleType === "admin" || roleType === "manager",
      bookings: true, // Todos podem criar bookings
    },
    read: {
      users: roleType === "admin" || roleType === "manager",
      settings: roleType === "admin" || roleType === "manager",
      retreats: true, // Todos podem ler retreats
      bookings: true, // Todos podem ler suas bookings
      profile: true, // Todos podem ler seu profile
    },
    update: {
      users: roleType === "admin",
      settings: roleType === "admin" || roleType === "manager",
      retreats: roleType === "admin" || roleType === "manager",
      bookings: roleType === "admin" || roleType === "manager",
      profile: true, // Todos podem atualizar seu profile
    },
    delete: {
      users: roleType === "admin",
      settings: false, // Ninguém pode deletar settings
      retreats: roleType === "admin",
      bookings: roleType === "admin" || roleType === "manager",
    },
  };

  return {
    ...baseUser,
    roles,
    permissions,
  };
};
