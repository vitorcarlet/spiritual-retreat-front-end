import { UserObject, UserRoles } from "next-auth";

export const createUserMock = (roleType: UserRoles): UserObject => {
  const baseUser = {
    id: 1,
    email: "admin@email.com",
    name: "Vitor MOCK",
    first_name: "Vitor",
    last_name: "MOCK",
    birth: "1990-01-01",
    cpf: "123.456.789-00",
    city: "Videira",
    state: "Santa Catarina",
    stateShort: "SC",
    role: roleType,
  };

  const permissions = {
    users: {
      create: roleType === "admin" ? true : false,
      read: roleType === "admin" || roleType === "manager" ? true : false,
      update: roleType === "admin" || roleType === "manager" ? true : false,
      delete: roleType === "admin" ? true : false,
    },
    settings: {
      create: roleType === "admin" ? true : false,
      read: true,
      update: roleType === "admin" || roleType === "manager" ? true : false,
      delete: roleType === "admin" ? true : false,
    },
    retreats: {
      create: roleType === "admin" || roleType === "manager" ? true : false,
      read: true, // Todos podem ler retreats
      update: roleType === "admin" || roleType === "manager" ? true : false,
      delete: roleType === "admin" ? true : false,
    },
    bookings: {
      create: true,
      read: true,
      update: roleType === "admin" || roleType === "manager" ? true : false,
      delete: roleType === "admin" ? true : false,
    },
    profile: {
      create: true,
      update: true,
      read: true,
      delete: true,
    },
    dashboard: {
      create: roleType === "admin" || roleType === "manager" ? true : false,
      read: true, // Todos podem ler dashboard
      update: roleType === "admin" || roleType === "manager" ? true : false,
      delete: roleType === "admin" ? true : false,
    },
    reports: {
      create: roleType === "admin" || roleType === "manager" ? true : false,
      read: roleType === "admin" || roleType === "manager" ? true : false,
      update: roleType === "admin" || roleType === "manager" ? true : false,
      delete: roleType === "admin" ? true : false,
    },
  };

  return {
    ...baseUser,
    permissions,
  };
};
