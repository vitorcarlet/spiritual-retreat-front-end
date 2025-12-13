import { jwtDecode } from "jwt-decode";
import { sendRequestServer } from "./sendRequestServer";
import { LoginResponse } from "../auth/types";

export async function authenticateUser(email: string, password: string) {
  try {
    const data = await sendRequestServer<LoginResponse>({
      url: "/login",
      isSilent: true,
      method: "post",
      payload: { email, password },
    });

    const tokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };

    if (!data || data.accessToken === undefined) throw tokens;

    const access = jwtDecode(tokens.accessToken!);
    const refresh = jwtDecode(tokens.refreshToken);

    const validity = {
      valid_until: access.exp,
      refresh_until: refresh.exp,
    };

    return {
      id: refresh.jti,
      tokens: tokens,
      user: data.user,
      validity: validity,
    };
  } catch (error) {
    console.error("Error during authorization:", error);
    return null;
  }
}
