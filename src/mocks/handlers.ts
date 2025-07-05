import { http, HttpResponse } from "msw";

type Request = {
  email?: string;
  password?: string;
};

export const handlers = [
  http.get("http://localhost:3001/api/user", () => {
    return HttpResponse.json({
      id: "1",
      name: "Vitor Calret",
      email: "vitorcarlet@email.com",
    });
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
      return HttpResponse.json(
        {
          message: "info do usuario",
          success: true,
          token_access: "mock-token-123",
          token_refresh: "mock-token-123-refresh",
          user: {
            name: "Vitor Carlet",
            email: "admin2@email.com",
            id: 1,
            permissions: [],
            role: "admin",
          },
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
