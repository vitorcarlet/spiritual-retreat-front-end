import { http, HttpResponse } from "msw";

type Request = {
  email?: string;
  password?: string;
};

export const handlers = [
  http.get("/user", () => {
    return HttpResponse.json({
      id: "1",
      name: "Admin Doe",
      email: "admin@email.com",
    });
  }),

  http.post("/login", async ({ request }) => {
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
        { token: "mock-token-123", email: "admin2@email.com" },
        { status: 200 }
      );
    }

    return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }),
];
