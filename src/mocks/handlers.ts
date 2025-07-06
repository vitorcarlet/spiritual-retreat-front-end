import { http, HttpResponse } from "msw";
import { BackendJWT, UserObject } from "next-auth";
import { create_access_token, create_refresh_token } from "./actions";

type Request = {
  email?: string;
  password?: string;
};

export const handlers = [
  http.get("http://localhost:3001/api/user", () => {
    return HttpResponse.json({
      id: "1",
      name: "Vitor Admin",
      email: "admin@email.com",
    });
  }),

  http.get("http://localhost:3001/api/logout", () => {
    return HttpResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  }),

  http.get("http://localhost:3001/api/refresh", () => {
    return HttpResponse.json({ access_token: "1234" }, { status: 200 });
  }),

  http.post("http://localhost:3001/api/login", async ({ request }) => {
    const { email, password } = (await request.json()) as Request;

    // Check if email and password are provided
    if (!email || !password) {
      return HttpResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    if (email === "admin@email.com" && password === "123") {
      const user: UserObject = {
        id: 1,
        email: "admin@email.com",
        name: "Vitor Admin",
        first_name: "Vitor",
        last_name: "Admin",
        roles: ["admin"],
        permissions: {
          read: ["profile", "settings"],
          write: ["profile"],
        },
      };
      const mock_data: BackendJWT = {
        access_token: create_access_token(user),
        refresh_token: create_refresh_token(user),
      };

      return HttpResponse.json(
        {
          message: "info do usuario",
          success: true,
          access_token: mock_data.access_token,
          refresh_token: mock_data.refresh_token,
          user,
        },
        { status: 200 }
      );
    }

    return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }),
  http.all("http://localhost:3001/*", ({ request }) => {
    console.log("⚠️ Unhandled request:", request.method, request.url);
    return HttpResponse.json({ error: "Endpoint not mocked" }, { status: 404 });
  }),
];
