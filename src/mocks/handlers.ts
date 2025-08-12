import { http, HttpResponse } from "msw";
import { BackendJWT, UserObject } from "next-auth";
import { create_access_token, create_refresh_token } from "./actions";
import { RegisterSchema } from "../schemas";
import { createUserMock } from "./handlerData/login";
import getUserById from "./handlerData/getUserById";
import { mockMetrics, mockRetreats } from "./handlerData/dashboard";
import { mockReports } from "./handlerData/reports";
import { mockUsers } from "./handlerData/users";

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

  http.get("http://localhost:3001/api/users", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageLimit = parseInt(url.searchParams.get("pageLimit") || "8", 10);

    const start = (page - 1) * pageLimit;
    const end = start + pageLimit;

    const paginatedUsers = mockUsers.slice(start, end);

    return HttpResponse.json(
      {
        rows: paginatedUsers,
        total: mockUsers.length,
        page,
        pageLimit,
      },
      { status: 200 }
    );
  }),

  http.post("http://localhost:3001/api/users/create", () => {
    const userId = Math.floor(Math.random() * 10) + 1;
    const user = getUserById(userId.toString());
    if (user) {
      return HttpResponse.json(user);
    }
    return HttpResponse.json(
      { error: "Creation has failed." },
      { status: 404 }
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

  http.get("http://localhost:3001/api/retreats", () => {
    return HttpResponse.json(mockRetreats, { status: 200 });
  }),

  http.get("http://localhost:3001/api/retreats/:id", ({ params }) => {
    const id = params.id as string;
    const retreat = mockRetreats.find((r) => r.id.toString() === id);
    if (retreat) {
      return HttpResponse.json(retreat, { status: 200 });
    }
    return HttpResponse.json({ error: "Retreat not found" }, { status: 404 });
  }),

  // Mock para /api/retreats/:id/metrics
  http.get("http://localhost:3001/api/retreats/:id/metrics", ({ params }) => {
    const id = params.id as string;
    const metrics = mockMetrics[id];
    if (metrics) {
      return HttpResponse.json(metrics, { status: 200 });
    }
    return HttpResponse.json({ error: "Retreat not found" }, { status: 404 });
  }),

  http.get("http://localhost:3001/api/reports", () => {
    return HttpResponse.json(mockReports, { status: 200 });
  }),

  // GET - Obter relatório específico
  http.get("http://localhost:3001/api/reports/:id", ({ params }) => {
    const id = params.id as string;
    const report = mockReports.find((r) => r.id === id);

    if (report) {
      return HttpResponse.json(report, { status: 200 });
    }

    return HttpResponse.json(
      { error: "Relatório não encontrado" },
      { status: 404 }
    );
  }),

  // POST - Criar novo relatório
  http.post("http://localhost:3001/api/reports", async ({ request }) => {
    const newReport = await request.json();

    // Garante que newReport é um objeto
    const reportData =
      typeof newReport === "object" && newReport !== null ? newReport : {};

    // Simula a criação atribuindo um ID
    const createdReport = {
      ...reportData,
      id: (mockReports.length + 1).toString(),
      dateCreation: new Date().toISOString(),
    };

    return HttpResponse.json(createdReport, { status: 201 });
  }),

  // PUT - Atualizar relatório existente
  http.put(
    "http://localhost:3001/api/reports/:id",
    async ({ params, request }) => {
      const id = params.id as string;
      const updatedData = await request.json();

      const reportData =
        typeof updatedData === "object" && updatedData !== null
          ? updatedData
          : {};
      const reportExists = mockReports.some((r) => r.id === id);

      if (!reportExists) {
        return HttpResponse.json(
          { error: "Relatório não encontrado" },
          { status: 404 }
        );
      }

      // Simula a atualização
      const updatedReport = {
        ...reportData,
        id,
      };

      return HttpResponse.json(updatedReport, { status: 200 });
    }
  ),

  // DELETE - Excluir relatório
  http.delete("http://localhost:3001/api/reports/:id", ({ params }) => {
    const id = params.id as string;
    const reportExists = mockReports.some((r) => r.id === id);

    if (!reportExists) {
      return HttpResponse.json(
        { error: "Relatório não encontrado" },
        { status: 404 }
      );
    }

    // Simula a exclusão retornando uma mensagem de sucesso
    return HttpResponse.json(
      {
        message: "Relatório excluído com sucesso",
        id,
      },
      { status: 200 }
    );
  }),

  //fallback handler for unhandled requests
  http.all("http://localhost:3001/*", ({ request }) => {
    console.log("⚠️ Unhandled request:", request.method, request.url);
    return HttpResponse.json({ error: "Endpoint not mocked" }, { status: 404 });
  }),
];
