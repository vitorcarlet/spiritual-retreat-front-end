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
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };

    if (!data || data.access_token === undefined) throw tokens;

    const access = jwtDecode(tokens.access_token!);
    const refresh = jwtDecode(tokens.refresh_token);

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
