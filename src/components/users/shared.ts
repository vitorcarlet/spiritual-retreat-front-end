import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import { UserObject } from "next-auth";

export const fetchUserData = async (
  userId: string
): Promise<UserObject | null> => {
  try {
    const result = await handleApiResponse<UserObject>(
      await sendRequestServerVanilla.get(`/api/user/${userId}`, {
        baseUrl: "http://localhost:3001", // URL do MSW
      })
    );

    if (result.success && result.data) {
      return result.data as UserObject;
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
  console.log(parts, "parts");
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
