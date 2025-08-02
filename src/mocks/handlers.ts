import { http, HttpResponse } from "msw";
import { BackendJWT, UserObject } from "next-auth";
import { create_access_token, create_refresh_token } from "./actions";
import { RegisterSchema } from "../schemas";
import { createUserMock } from "./handlerData/login";
import getUserById from "./handlerData/getUserById";
import { mockMetrics, mockRetreats } from "./handlerData/dashboard";

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

  http.get("http://localhost:3001/api/users", () => {
    return HttpResponse.json(
      [
        {
          id: "1",
          name: "Vitor Admin",
          email: "admin@email.com",
        },
        {
          id: "2",
          name: "Maria Manager",
          email: "manager@email.com",
        },
        {
          id: "3",
          name: "Pedro Consultant",
          email: "consultant@email.com",
        },
        {
          id: "4",
          name: "Ana User",
          email: "user@email.com",
        },
      ],
      { status: 200 }
    );
  }),

  http.get("http://localhost:3001/api/user/:id", ({ params }) => {
    const userId = params.id as string;
    const user = getUserById(userId);
    if (user) {
      return HttpResponse.json(user);
    }
    return HttpResponse.json({ error: "User not found" }, { status: 404 });
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

    if (!email || !password) {
      return HttpResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    // ✅ Diferentes usuários com diferentes roles
    let user: UserObject;

    if (email === "admin@email.com" && password === "123") {
      user = createUserMock("admin");
    } else if (email === "manager@email.com" && password === "123") {
      user = createUserMock("manager");
    } else if (email === "consultant@email.com" && password === "123") {
      user = createUserMock("consultant");
    } else if (email === "participant@email.com" && password === "123") {
      user = createUserMock("participant");
    } else {
      return HttpResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const mock_data: BackendJWT = {
      access_token: create_access_token(user),
      refresh_token: create_refresh_token(user),
    };

    return HttpResponse.json(
      {
        message: "Login successful",
        success: true,
        access_token: mock_data.access_token,
        refresh_token: mock_data.refresh_token,
        user,
      },
      { status: 200 }
    );
  }),
  http.post("http://localhost:3001/api/register", async ({ request }) => {
    const { email, password, code } = (await request.json()) as RegisterSchema;

    // Simular criação de usuário
    if (email && password && code === "654321") {
      return HttpResponse.json(
        {
          message: "User registered successfully",
          success: true,
        },
        { status: 201 }
      );
    }

    if (email && password && code !== "654321") {
      return HttpResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    return HttpResponse.json(
      { error: "Invalid registration data" },
      { status: 400 }
    );
  }),

  http.all("http://localhost:3001/*", ({ request }) => {
    console.log("⚠️ Unhandled request:", request.method, request.url);
    return HttpResponse.json({ error: "Endpoint not mocked" }, { status: 404 });
  }),

  http.get("/api/retreats", () => {
    return HttpResponse.json(mockRetreats, { status: 200 });
  }),

  // Mock para /api/retreats/:id/metrics
  http.get("/api/retreats/:id/metrics", ({ params }) => {
    const id = params.id as string;
    const metrics = mockMetrics[id];
    if (metrics) {
      return HttpResponse.json(metrics, { status: 200 });
    }
    return HttpResponse.json({ error: "Retreat not found" }, { status: 404 });
  }),
];
