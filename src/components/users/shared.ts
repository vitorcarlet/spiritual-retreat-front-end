import { UserObject } from "next-auth";
import apiClient from "@/src/lib/axiosClientInstance";

export const fetchUserData = async (
  userId: string
): Promise<UserObject | null> => {
  try {
    const response = await apiClient.get<UserObject>(`/users/${userId}`);

    if (response && response.data) {
      return response.data as UserObject;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    return null;
  }
};

export const getPermissionByPathname = (pathname: string): string => {
  // Remove query params/hash and split by "/"
  const cleanPath = pathname.split("?")[0].split("#")[0];
  const parts = cleanPath.replace(/^\/+|\/+$/g, "").split("/");

  //  /user/123 → ["user", "123"]
  if (parts.length === 2 && parts[0] === "users" && parts[1]) {
    return "users.update";
  }

  // /users/create → ["users", "create"]
  if (parts.length === 2 && parts[0] === "users" && parts[1] === "create") {
    return "users.create";
  }

  //  userPermissions → ["userPermissions"]
  if (
    parts.length === 3 &&
    parts[0] === "users" &&
    parts[2] === "permissions"
  ) {
    return "users.update";
  }

  // /retreats/:id → ["retreats", ":id"]
  if (parts.length === 2 && parts[0] === "retreats" && parts[1]) {
    return "retreats.update";
  }

  return "";
};
