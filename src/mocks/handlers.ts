import { http, HttpResponse, StrictRequest } from "msw";

type Request = {
  email: string;
  password: string;
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
    const { email, password } = await request.json();
    if (email === "admin@email.com" && password === "123") {
      return HttpResponse.json(
        { token: "mock-token-123", email },
        { status: 200 }
      );
    }
    return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }),
];
