import { http, HttpResponse } from "msw";
import { BackendJWT, UserObject } from "next-auth";
import { create_access_token, create_refresh_token } from "./actions";
import { RegisterSchema } from "../schemas";
import { createUserMock } from "./handlerData/login";
import getUserById from "./handlerData/getUserById";
import { mockMetrics, mockRetreats } from "./handlerData/dashboard";
import { mockReportDetails, mockReports } from "./handlerData/reports";
import { mockUsers } from "./handlerData/users";
import { mockContemplatedParticipants } from "./handlerData/retreats/contemplated";
import { mockFamilies } from "./handlerData/retreats/families";
import { mockTents } from "./handlerData/retreats/tents";
import { columnsMock } from "./handlerData/reports/columns";
import { createByOrigin, MockNotification, mockNotifications } from "./handlerData/notifications";

type Request = {
  email?: string;
  password?: string;
};

function paginate<T>(items: T[], urlObj: URL) {
  const rawPage = urlObj.searchParams.get("page");
  const rawLimit = urlObj.searchParams.get("pageLimit");
  // Aceita pageLimit=all para retornar tudo
  const pageLimitAll = rawLimit === "all";
  const page = Math.max(parseInt(rawPage || "1", 10), 1);
  const pageLimit = pageLimitAll
    ? items.length
    : Math.max(parseInt(rawLimit || "10", 10), 1);

  const start = (page - 1) * pageLimit;
  const end = start + pageLimit;
  const slice = items.slice(start, end);

  return {
    rows: slice,
    total: items.length,
    page,
    pageLimit: pageLimitAll ? "all" : pageLimit,
    hasNextPage: pageLimitAll ? false : end < items.length,
    hasPrevPage: page > 1,
  };
}

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
    const payload = paginate(mockUsers, url);
    return HttpResponse.json(payload, { status: 200 });
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

  http.get("http://localhost:3001/api/user/:id/credentials", ({ params }) => {
    const userId = params.id as string;
    const user = getUserById(userId);
    if (user) {
      return HttpResponse.json(createCredentialsForUser(user));
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
    } else if (email === "participant2@email.com" && password === "123") {
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
        isNonCodeConfirmed: user.role === "participant" ? true : false,
        user: user.role === "participant" ? { id: user.id } : user,
      },
      { status: 200 }
    );
  }),

  http.post("http://localhost:3001/api/verify-code", async ({ request }) => {
    const { email, code } = (await request.json()) as {
      email?: string;
      code?: string;
    };

    if (!email || !code) {
      return HttpResponse.json(
        { error: "Missing email or code" },
        { status: 400 }
      );
    }
    // Simular verificação de código
    if (code === "123456") {
      // Código correto
      // Retornar tokens e dados do usuário
      const user = getUserById("4");
      if (user) {
        return HttpResponse.json(
          {
            message: "Login successful",
            access_token: create_access_token(user),
            refresh_token: create_refresh_token(user),
            user,
          },
          { status: 200 }
        );
      }
    }
    return HttpResponse.json(
      { error: "Wrong E-mail or code." },
      { status: 400 }
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

  http.get(
    "http://localhost:3001/api/retreats",
    ({ request /*, params */ }) => {
      const url = new URL(request.url);

      const isSelectAutocomplete =
        url.searchParams.get("selectAutocomplete") === "true";
      //url.searchParams.get("variant") === "selectAutocomplete" ||
      // url.searchParams.get("type") === "selectAutocomplete";

      if (isSelectAutocomplete) {
        const search = (url.searchParams.get("search") || "").toLowerCase();

        let list = mockRetreats;

        if (search) {
          list = list.filter((r) => r.title.toLowerCase().includes(search));
        }

        // Optional limit for autocomplete (default 20)
        const limit = parseInt(url.searchParams.get("limit") || "20", 10);
        const sliced = list.slice(0, isNaN(limit) ? 20 : limit);

        return HttpResponse.json(
          {
            options: sliced.map((r) => ({
              value: r.id,
              label: r.title,
              // extra metadata if needed by frontend
              // isActive: r.status === "running" || r.status === "open",
              isActive: true,
              startDate: r.startDate,
              endDate: r.endDate,
              location: r.location,
            })),
            total: list.length,
          },
          { status: 200 }
        );
      }

      // Fallback to normal paginated payload
      const payload = paginate(mockRetreats, url);
      return HttpResponse.json(payload, { status: 200 });
    }
  ),

  http.get("http://localhost:3001/api/retreats/:id", ({ params }) => {
    const id = params.id as string;
    const retreat = mockRetreats.find((r) => r.id.toString() === id);
    if (retreat) {
      return HttpResponse.json(retreat, { status: 200 });
    }
    return HttpResponse.json({ error: "Retreat not found" }, { status: 404 });
  }),

  // Mock para /api/retreats/:id/metrics
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  http.get("http://localhost:3001/api/retreats/:id/metrics", ({ params }) => {
    //const id = params.id as string;
    const metrics = mockMetrics[1];
    if (metrics) {
      return HttpResponse.json(metrics, { status: 200 });
    }
    return HttpResponse.json({ error: "Retreat not found" }, { status: 404 });
  }),

  http.get(
    "http://localhost:3001/api/retreats/:id/contemplated",
    ({ request /*, params */ }) => {
      const url = new URL(request.url);
      const payload = paginate(mockContemplatedParticipants, url);
      return HttpResponse.json(payload, { status: 200 });
    }
  ),

  http.get(
    "http://localhost:3001/api/retreats/:id/non-contemplated",
    ({ request /*, params */ }) => {
      const url = new URL(request.url);
      const payload = paginate(mockContemplatedParticipants, url);
      return HttpResponse.json(payload, { status: 200 });
    }
  ),

  http.get(
    "http://localhost:3001/api/retreats/:id/tents",
    ({ request /*, params */ }) => {
      const url = new URL(request.url);
      const payload = paginate(mockTents, url);
      return HttpResponse.json(payload, { status: 200 });
    }
  ),

  http.get(
    "http://localhost:3001/api/retreats/:id/families",
    ({ request /*, params */ }) => {
      const url = new URL(request.url);
      const payload = paginate(mockFamilies, url);
      return HttpResponse.json(payload, { status: 200 });
    }
  ),

  http.get(
    "http://localhost:3001/api/retreats/:id/families/unassigned",
    ({ params }) => {
      const retreatId = params.id;
      const unassignedParticipants = mockFamilies
        .flatMap((family) => family.members || [])
        .filter((member) => !member.familyId)
        .slice(0, 10)
        .map((member, index) => ({
          id: `${retreatId || "retreat"}-unassigned-${index + 1}`,
          name: member.name ?? `Participante ${index + 1}`,
          email: member.email ?? undefined,
          phone: member.phone ?? undefined,
          group: member.group ?? undefined,
        }));

      // Provide fallback mock participants if none found in families data
      const fallbackParticipants = [
        {
          id: "unassigned-1",
          name: "Alice Carvalho",
          email: "alice.carvalho@email.com",
          phone: "(11) 98888-1111",
          group: "Grupo A",
        },
        {
          id: "unassigned-2",
          name: "Bruno Nascimento",
          email: "bruno.nascimento@email.com",
          phone: "(11) 98888-2222",
          group: "Grupo B",
        },
        {
          id: "unassigned-3",
          name: "Camila Ribeiro",
          email: "camila.ribeiro@email.com",
          phone: "(11) 98888-3333",
          group: "Grupo C",
        },
      ];

      const participants = unassignedParticipants.length
        ? unassignedParticipants
        : fallbackParticipants;

      return HttpResponse.json(
        {
          success: true,
          participants,
        },
        { status: 200 }
      );
    }
  ),

  http.post(
    "http://localhost:3001/api/retreats/:id/families/draw",
    async ({ params }) => {
      const retreatId = params.id as string;

      return HttpResponse.json(
        {
          success: true,
          message: `Famílias sorteadas com sucesso para o retiro ${retreatId}`,
          data: {
            retreatId,
            processedParticipants: Math.floor(Math.random() * 10) + 1,
            createdFamilies: Math.floor(Math.random() * 3) + 1,
          },
        },
        { status: 200 }
      );
    }
  ),

  http.get(
    "http://localhost:3001/api/retreats/:id/families/rules",
    ({ params }) => {
      const retreatId = params.id as string;

      return HttpResponse.json(
        {
          success: true,
          retreatId,
          rules: {
            maxMembersPerFamily: 6,
            genderBalance: {
              enabled: true,
              ratio: 0.5,
              tolerance: 1,
              label: "50% homens / 50% mulheres",
            },
            preventSameRealFamily: true,
            preventSameCity: true,
          },
        },
        { status: 200 }
      );
    }
  ),

  // Family configuration endpoints
  http.get(
    "http://localhost:3001/api/retreats/:id/families/config",
    () => {
      return HttpResponse.json({
        success: true,
        data: {
          config: {
            defaultFamilySize: 6,
            maxFamilySize: 8,
            totalFamilies: mockFamilies.length,
            totalParticipants: 42,
          }
        }
      }, { status: 200 });
    }
  ),

  http.put(
    "http://localhost:3001/api/retreats/:id/families/config",
    async ({ request }) => {
      const body = await request.json() as {
        defaultFamilySize: number;
        maxFamilySize: number;
      };
      
      return HttpResponse.json({
        success: true,
        message: "Configuração das famílias atualizada com sucesso",
        data: {
          config: body,
        },
      }, { status: 200 });
    }
  ),

  // Family creation endpoint
  http.post(
    "http://localhost:3001/api/retreats/:id/families",
    async ({ request }) => {
      const body = await request.json() as {
        name: string;
        description?: string;
        maxMembers: number;
        tentNumber?: string;
        sector?: string;
      };
      
      return HttpResponse.json({
        success: true,
        data: {
          id: Math.random().toString(36).substr(2, 9),
          ...body,
          members: [],
          createdAt: new Date().toISOString(),
        }
      }, { status: 201 });
    }
  ),

  // Get available participants for a retreat
  http.get(
    "http://localhost:3001/api/retreats/:id/participants/available",
    () => {
      const mockParticipants = [
        {
          id: 1,
          name: "João Silva",
          email: "joao.silva@email.com",
          phone: "(11) 99999-1111",
          age: 25,
          isAssigned: false,
          location: "São Paulo, SP",
        },
        {
          id: 2,
          name: "Maria Santos",
          email: "maria.santos@email.com",
          phone: "(11) 99999-2222",
          age: 32,
          isAssigned: false,
          location: "Rio de Janeiro, RJ",
        },
        {
          id: 3,
          name: "Pedro Oliveira",
          email: "pedro.oliveira@email.com",
          phone: "(11) 99999-3333",
          age: 28,
          isAssigned: false,
          location: "Belo Horizonte, MG",
        },
        {
          id: 4,
          name: "Ana Costa",
          email: "ana.costa@email.com",
          phone: "(11) 99999-4444",
          age: 29,
          isAssigned: false,
          location: "Porto Alegre, RS",
        },
        {
          id: 5,
          name: "Carlos Pereira",
          email: "carlos.pereira@email.com",
          phone: "(11) 99999-5555",
          age: 35,
          isAssigned: false,
          location: "Salvador, BA",
        },
        {
          id: 6,
          name: "Fernanda Lima",
          email: "fernanda.lima@email.com",
          phone: "(11) 99999-6666",
          age: 27,
          isAssigned: false,
          location: "Brasília, DF",
        },
        {
          id: 7,
          name: "Ricardo Mendes",
          email: "ricardo.mendes@email.com",
          phone: "(11) 99999-7777",
          age: 31,
          isAssigned: false,
          location: "Curitiba, PR",
        },
        {
          id: 8,
          name: "Juliana Ferreira",
          email: "juliana.ferreira@email.com",
          phone: "(11) 99999-8888",
          age: 26,
          isAssigned: false,
          location: "Fortaleza, CE",
        },
        {
          id: 9,
          name: "Rafael Alves",
          email: "rafael.alves@email.com",
          phone: "(11) 99999-9999",
          age: 33,
          isAssigned: false,
          location: "Recife, PE",
        },
        {
          id: 10,
          name: "Luciana Rocha",
          email: "luciana.rocha@email.com",
          phone: "(11) 99999-0000",
          age: 24,
          isAssigned: false,
          location: "Goiânia, GO",
        },
      ];

      return HttpResponse.json(
           mockParticipants,
       { status: 200 });
    }
  ),

  // Add participants to family endpoint
  http.post(
    "http://localhost:3001/api/retreats/:id/families/add-participants",
    async ({ request }) => {
      const body = await request.json() as {
        familyId: string;
        participantIds: number[];
        role: "leader" | "member";
      };
      
      return HttpResponse.json({
        success: true,
        message: `${body.participantIds.length} participante(s) adicionado(s) à família com sucesso`,
        data: {
          familyId: body.familyId,
          addedParticipants: body.participantIds.length,
          role: body.role,
        }
      }, { status: 200 });
    }
  ),

  // Send message to families endpoint
  http.post(
    "http://localhost:3001/api/retreats/:id/families/send-message",
    async ({ request }) => {
      const body = await request.json() as {
        subject: string;
        message: string;
        familyIds: string[];
        messageType: "email" | "sms" | "notification";
      };
      
      return HttpResponse.json({
        success: true,
        message: `Mensagem enviada para ${body.familyIds.length} família(s) com sucesso`,
        data: {
          messagesSent: body.familyIds.length,
          messageType: body.messageType,
        }
      }, { status: 200 });
    }
  ),

  http.get(
    "http://localhost:3001/api/public/retreats",
    ({ request /*, params */ }) => {
      const url = new URL(request.url);

      const isSelectAutocomplete =
        url.searchParams.get("selectAutocomplete") === "true";
      //url.searchParams.get("variant") === "selectAutocomplete" ||
      // url.searchParams.get("type") === "selectAutocomplete";

      if (isSelectAutocomplete) {
        const search = (url.searchParams.get("search") || "").toLowerCase();

        let list = mockRetreats;

        if (search) {
          list = list.filter((r) => r.title.toLowerCase().includes(search));
        }

        // Optional limit for autocomplete (default 20)
        const limit = parseInt(url.searchParams.get("limit") || "20", 10);
        const sliced = list.slice(0, isNaN(limit) ? 20 : limit);

        return HttpResponse.json(
          {
            options: sliced.map((r) => ({
              value: r.id,
              label: r.title,
              // extra metadata if needed by frontend
              startDate: r.startDate,
              endDate: r.endDate,
            })),
            total: list.length,
          },
          { status: 200 }
        );
      }

      // Fallback to normal paginated payload
      const payload = paginate(mockRetreats, url);
      return HttpResponse.json(payload, { status: 200 });
    }
  ),

  // Public retreats endpoint supporting selectAutocomplete variant

  http.get("http://localhost:3001/api/public/retreats/:id", ({ params }) => {
    const id = params.id as string;
    const retreat = mockRetreats.find((r) => r.id.toString() === id);
    if (retreat) {
      return HttpResponse.json(retreat, { status: 200 });
    }
    return HttpResponse.json({ error: "Retreat not found" }, { status: 404 });
  }),

  http.get(
    "http://localhost:3001/api/public/retreats/:id/form/participant",
    ({ params }) => {
      const id = params.id as string;

      const form = {
        id: `retreat-${id}-participant-form`,
        title: "Inscrição - XV RahaminVIDA",
        description: "Preencha seus dados para participar do retiro",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sections: [
          {
            id: "section-personal-data",
            title: "Dados Pessoais",
            description: "Informações pessoais básicas",
            fields: [
              {
                id: "field-nome-completo",
                name: "nome_completo",
                label: "Nome Completo",
                type: "text",
                required: true,
                helperText: "Digite seu nome completo",
                placeholder: "Ex: João Silva Santos",
                grid: 12
              },
              {
                id: "field-cpf",
                name: "cpf",
                label: "C.P.F",
                type: "text",
                maskType: "cpf",
                required: true,
                helperText: "Digite seu CPF",
                placeholder: "000.000.000-00",
                grid: 6
              },
              {
                id: "field-sexo",
                name: "sexo",
                label: "Sexo",
                type: "select",
                required: true,
                helperText: "Selecione seu sexo",
                grid: 6,
                options: [
                  { id: "opt-masculino", value: "Masculino" },
                  { id: "opt-feminino", value: "Feminino" }
                ]
              },
              {
                id: "field-data-nascimento",
                name: "data_nascimento",
                label: "Data de nascimento",
                type: "text",
                maskType: "date",
                required: true,
                helperText: "Selecione sua data de nascimento",
                grid: 4
              },
              {
                id: "field-idade",
                name: "idade",
                label: "Idade",
                type: "number",
                required: true,
                helperText: "Digite sua idade",
                placeholder: "Ex: 25",
                grid: 4,
                min: 16,
                max: 120
              },
              {
                id: "field-estou-gravida",
                name: "estou_gravida",
                label: "Estou grávida",
                type: "select",
                required: false,
                helperText: "Selecione se estiver grávida",
                grid: 4,
                options: [
                  { id: "opt-nao", value: "Não" },
                  { id: "opt-sim-3meses", value: "Sim (mais de 3 meses)" },
                  { id: "opt-sim-menos-3meses", value: "Sim (menos de 3 meses)" }
                ]
              },
              {
                id: "field-peso",
                name: "peso",
                label: "Peso (kg)",
                type: "number",
                required: true,
                helperText: "Digite seu peso em quilogramas",
                placeholder: "Ex: 70",
                grid: 3,
                min: 30,
                max: 300
              },
              {
                id: "field-altura",
                name: "altura",
                label: "Altura (cm)",
                type: "number",
                required: true,
                helperText: "Digite sua altura em centímetros",
                placeholder: "Ex: 175",
                grid: 3,
                min: 100,
                max: 250
              },
              {
                id: "field-estado-civil",
                name: "estado_civil",
                label: "Estado Civil",
                type: "select",
                required: true,
                helperText: "Selecione seu estado civil",
                grid: 3,
                options: [
                  { id: "opt-solteiro", value: "Solteiro(a)" },
                  { id: "opt-casado", value: "Casado(a)" },
                  { id: "opt-divorciado", value: "Divorciado(a)" },
                  { id: "opt-viuvo", value: "Viúvo(a)" }
                ]
              },
              {
                id: "field-profissao",
                name: "profissao",
                label: "Profissão",
                type: "text",
                required: true,
                helperText: "Digite sua profissão",
                placeholder: "Ex: Engenheiro",
                grid: 3
              },
              {
                id: "field-tamanho-camiseta",
                name: "tamanho_camiseta",
                label: "Tamanho de Camiseta",
                type: "select",
                required: true,
                helperText: "Selecione o tamanho da sua camiseta",
                grid: 3,
                options: ["PP", "P", "M", "G", "GG", "XG"].map((s) => ({
                  id: `opt-tshirt-${s.toLowerCase()}`,
                  value: s
                }))
              },
              {
                id: "field-location",
                name: "location",
                label: "Cidade e Estado",
                type: "text",
                maskType: 'location',
                required: true,
                helperText: "Selecione seu estado e cidade",
                placeholder: "Selecione estado e cidade",
                grid: 3
              },
              {
                id: "field-rua-casa",
                name: "rua_e_n_casa",
                label: "Rua e Nº da Casa",
                type: "text",
                required: true,
                helperText: "Digite o endereço completo",
                placeholder: "Ex: Rua das Flores, 123",
                grid: 6
              },
              {
                id: "field-bairro",
                name: "bairro",
                label: "Bairro",
                type: "text",
                required: true,
                helperText: "Digite o bairro",
                placeholder: "Ex: Centro",
                grid: 3
              }
            ]
          },
          {
            id: "section-contacts",
            title: "Contatos",
            description: "Informações de contato",
            fields: [
              {
                id: "field-email",
                name: "email",
                label: "Email",
                type: "text",
                maskType: "email",
                required: true,
                helperText: "Digite seu e-mail principal",
                placeholder: "voce@exemplo.com",
                grid: 6
              },
              {
                id: "field-n-whatsapp",
                name: "n_whatsapp",
                label: "Nº Whatsapp",
                type: "text",
                maskType: "phone",
                required: true,
                helperText: "Digite seu WhatsApp com DDD",
                placeholder: "+55 (11) 99999-9999",
                grid: 6
              },
              {
                id: "field-celular",
                name: "celular",
                label: "Celular",
                type: "text",
                maskType: "phone",
                required: true,
                helperText: "Digite seu celular com DDD",
                placeholder: "+55 (11) 99999-9999",
                grid: 4
              },
              {
                id: "field-celular-vizinho",
                name: "celular_vizinho_conhecido",
                label: "Celular de vizinho ou conhecido",
                type: "text",
                maskType: "phone",
                required: true,
                helperText: "Celular de alguém que NÃO participará do retiro",
                placeholder: "+55 (11) 99999-9999",
                grid: 4
              },
              {
                id: "field-celular-parente",
                name: "celular_parente_conhecido",
                label: "Celular de parente ou conhecido",
                type: "text",
                maskType: "phone",
                required: true,
                helperText: "Celular de alguém que NÃO participará do retiro",
                placeholder: "+55 (11) 99999-9999",
                grid: 4
              },
              {
                id: "field-facebook",
                name: "nome_usuario_facebook",
                label: "Nome Usuário Facebook",
                type: "text",
                required: false,
                helperText: "Digite seu usuário do Facebook ou 'não tenho'",
                placeholder: "Ex: joao.silva",
                grid: 4
              },
              {
                id: "field-instagram",
                name: "instagram",
                label: "Instagram",
                type: "text",
                required: false,
                helperText: "Digite seu usuário do Instagram ou 'não tenho'",
                placeholder: "Ex: @joaosilva",
                grid: 4
              }
            ]
          },
          {
            id: "section-family",
            title: "Familiares",
            description: "Informações sobre seus pais e família",
            fields: [
              {
                id: "field-pai-esta",
                name: "pai_esta",
                label: "Pai está:",
                type: "select",
                required: true,
                helperText: "Situação atual do pai",
                grid: 4,
                options: [
                  { id: "opt-vivo", value: "Vivo" },
                  { id: "opt-falecido", value: "Falecido" },
                  { id: "opt-nao-sei", value: "Não sei" }
                ]
              },
              {
                id: "field-nome-pai",
                name: "nome_pai",
                label: "Nome do Pai",
                type: "text",
                required: true,
                helperText: "Digite o nome completo do pai",
                grid: 4
              },
              {
                id: "field-celular-pai",
                name: "celular_pai",
                label: "Celular do Pai",
                type: "text",
                maskType: "phone",
                required: false,
                helperText: "Digite o celular do pai se disponível",
                placeholder: "+55 (49) 98877-6633",
                grid: 4
              },
              {
                id: "field-mae-esta",
                name: "mae_esta",
                label: "Mãe está:",
                type: "select",
                required: true,
                helperText: "Situação atual da mãe",
                grid: 4,
                options: [
                  { id: "opt-viva", value: "Viva" },
                  { id: "opt-falecida", value: "Falecida" },
                  { id: "opt-nao-sei", value: "Não sei" }
                ]
              },
              {
                id: "field-nome-mae",
                name: "nome_mae",
                label: "Nome da Mãe",
                type: "text",
                required: true,
                helperText: "Digite o nome completo da mãe",
                grid: 4
              },
              {
                id: "field-celular-mae",
                name: "celular_mae",
                label: "Celular da Mãe",
                type: "text",
                maskType: "phone",
                required: false,
                helperText: "Digite o celular da mãe se disponível",
                placeholder: "+55 (49) 97766-5544",
                grid: 4
              },
              {
                id: "field-sofreu-perda",
                name: "sofreu_perda_familiar",
                label: "Sofreu perda familiar nos últimos 6 meses?",
                type: "radio",
                required: true,
                helperText: "Selecione se sofreu alguma perda recente",
                grid: 6,
                options: [
                  { id: "opt-sim", value: "Sim" },
                  { id: "opt-nao", value: "Não" }
                ]
              },
              {
                id: "field-qual-perda",
                name: "quem_qual_perda_familiar",
                label: "Quem/qual perda familiar",
                type: "text",
                required: false,
                helperText: "Descreva a perda se houver",
                placeholder: "Ex: Avô falecido em março",
                grid: 6
              },
              {
                id: "field-alguem-inscreveu",
                name: "alguem_preencheu_ficha",
                label: "Algum parente ou amigo(a) preencheu a ficha de inscrição para esse RahaminVida?",
                type: "radio",
                required: true,
                helperText: "Alguém que você conhece se inscreveu?",
                grid: 12,
                options: [
                  { id: "opt-sim", value: "Sim" },
                  { id: "opt-nao", value: "Não" }
                ]
              },
              {
                id: "field-grau-parentesco",
                name: "grau_parentesco_preencheu",
                label: "Qual o grau de parentesco da(s) pessoa(s) que fez(eram) a inscrição(s)?",
                type: "chips",
                required: false,
                helperText: "Selecione todos que se aplicam",
                grid: 12,
                options: [
                  { id: "opt-namorado", value: "Namorado(a)" },
                  { id: "opt-esposo", value: "Esposo(a)" },
                  { id: "opt-pai", value: "Pai" },
                  { id: "opt-mae", value: "Mãe" },
                  { id: "opt-amigo", value: "Amigo(a)" },
                  { id: "opt-primo", value: "Primo(a)" },
                  { id: "opt-tios", value: "Tios" },
                  { id: "opt-nenhum", value: "Nenhum" }
                ]
              },
              {
                id: "field-nome-pessoas-inscreveram",
                name: "nome_pessoa_preencheu",
                label: "Nome da(s) pessoa(s)/parente(s) que fez(eram) a(s) inscrição(s)",
                type: "textarea",
                required: false,
                helperText: "Digite os nomes separados por vírgula",
                placeholder: "Ex: Maria Silva, João Santos",
                grid: 12
              }
            ]
          },
          {
            id: "section-faith",
            title: "Caminhada de Fé",
            description: "Informações sobre sua religião e participação anterior",
            fields: [
              {
                id: "field-religiao",
                name: "religiao",
                label: "Qual sua Religião",
                type: "text",
                required: true,
                helperText: "Digite sua religião",
                placeholder: "Ex: Católica, Evangélica, etc",
                grid: 12
              },
              {
                id: "field-inscricao-anterior-nao-chamado",
                name: "ja_fez_inscricao_nao_chamado",
                label: "Você já fez inscrição para algum Rahamin (Vida ou Porta) e não foi chamado?",
                type: "chips",
                required: false,
                helperText: "Selecione todos os retiros que você se inscreveu mas não foi chamado",
                grid: 12,
                multiple: true,
                options: [
                  { id: "opt-nenhum", value: "NÃO fiz inscrição para Nenhum (nem Vida nem Porta)" },
                  { id: "opt-porta-1", value: "RahaminPorta I - Outubro 2015 - EUA" },
                  { id: "opt-porta-2", value: "RahaminPorta II - Fevereiro 2016 - Caçador" },
                  { id: "opt-porta-3", value: "RahaminPorta III - Março 2016 - Morro da Fumaça" },
                  { id: "opt-porta-4", value: "RahaminPorta IV - Agosto 2016 - Caçador" },
                  { id: "opt-porta-5", value: "RahaminPorta V - I Juvenil Fevereiro 2017 - Caçador" },
                  { id: "opt-porta-6", value: "RahaminPorta VI - Maio 2017 - Caçador" },
                  { id: "opt-porta-7", value: "RahaminPorta VII - Novembro 2017 - Caçador" },
                  { id: "opt-porta-8", value: "RahaminPorta VIII - Junho 2018 - Caçador" },
                  { id: "opt-vida-1", value: "RahaminVida I - Março 2016 - Caçador" },
                  { id: "opt-vida-2", value: "RahaminVida II - Outubro 2016 - Caçador" },
                  { id: "opt-vida-3", value: "RahaminVida III - Janeiro 2017 - Caçador" },
                  { id: "opt-vida-4", value: "RahaminVida IV - I Juvenil Setembro 2017 - Caçador" },
                  { id: "opt-vida-5", value: "RahaminVida V - Fevereiro 2018 - Caçador" },
                  { id: "opt-vida-6", value: "RahaminVida VI - Outubro 2018 - Caçador" },
                  { id: "opt-vida-7", value: "RahaminVida VII - Fevereiro 2019 - Caçador" },
                  { id: "opt-vida-8", value: "RahaminVida VIII - Outubro 2019 - Caçador" },
                  { id: "opt-vida-9", value: "RahaminVida IX - Outubro 2022 - Caçador" },
                  { id: "opt-vida-10", value: "RahaminVida X - Fevereiro 2023 - Caçador" },
                  { id: "opt-vida-11", value: "RahaminVida XI - Outubro 2023 - Caçador" },
                  { id: "opt-vida-12", value: "RahaminVida XII - Fevereiro 2024 - Caçador" },
                  { id: "opt-rcporta-1", value: "R.Crist.Porta I - Setembro 2024 - Caçador" },
                  { id: "opt-vida-13", value: "RahaminVida XIII - Novembro 2024 - Caçador" },
                  { id: "opt-vida-15", value: "RahaminVida XV - Fevereiro 2025 - Caçador" }
                ]
              }
            ]
          },
          {
            id: "section-physical",
            title: "Condição Física",
            description: "Informações sobre saúde e condição física",
            fields: [
              {
                id: "field-deficiencia",
                name: "deficiencia_limitacao_fisica",
                label: "Tenho alguma deficiência/limitação física? Qual?",
                type: "textarea",
                required: false,
                helperText: "Descreva qualquer deficiência ou limitação física",
                placeholder: "Descreva se houver alguma limitação",
                grid: 12
              },
              {
                id: "field-cirurgia",
                name: "cirurgia_recente",
                label: "Passei por alguma cirurgia ou procedimento recentemente? Qual cirurgia e a quanto tempo?",
                type: "textarea",
                required: false,
                helperText: "Descreva cirurgias recentes",
                placeholder: "Ex: Apendicite há 2 meses",
                grid: 12
              }
            ]
          },
          {
            id: "section-other-info",
            title: "Outras Informações",
            description: "Participação anterior em RahaminVida",
            fields: [
              {
                id: "field-ja-fez-rahaminvida",
                name: "ja_fez_rahaminvida",
                label: "Você já fez o RahaminVida? Marque!",
                type: "chips",
                required: true,
                helperText: "Selecione todos os RahaminVida que você já participou",
                grid: 12,
                multiple: true,
                options: [
                  { id: "opt-nao-fiz", value: "NÃO FIZ" },
                  { id: "opt-rv-1", value: "RahaminVida I - Março 2016 - Caçador" },
                  { id: "opt-rv-2", value: "RahaminVida II - Outubro 2016 - Caçador" },
                  { id: "opt-rv-3", value: "RahaminVida III - Janeiro 2017 - Caçador" },
                  { id: "opt-rv-4", value: "RahaminVida IV - I Juvenil Setembro 2017 - Caçador" },
                  { id: "opt-rv-5", value: "RahaminVida V - Fevereiro 2018 - Caçador" },
                  { id: "opt-rv-6", value: "RahaminVida VI - Outubro 2018 - Caçador" },
                  { id: "opt-rv-7", value: "RahaminVida VII - Fevereiro 2019 - Caçador" },
                  { id: "opt-rv-8", value: "RahaminVida VIII - Outubro 2019 - Caçador" },
                  { id: "opt-rv-9", value: "RahaminVida IX - Outubro 2022 - Caçador" },
                  { id: "opt-rv-10", value: "RahaminVida X - Fevereiro 2023 - Caçador" },
                  { id: "opt-rv-11", value: "RahaminVida XI - Outubro 2023 - Caçador" },
                  { id: "opt-rv-12", value: "RahaminVida XII - Fevereiro 2024 - Caçador" },
                  { id: "opt-rv-13", value: "RahaminVida XIII - Novembro 2024 - Caçador" },
                  { id: "opt-rv-14", value: "RahaminVida XIV - Fevereiro 2025 - Caçador" }
                ]
              }
            ]
          },
          {
            id: "section-photos",
            title: "Foto e Documento",
            description: "Envie sua foto e documento de identificação",
            fields: [
              {
                id: "field-envio-foto",
                name: "envio_foto",
                label: "Envie-nos uma foto sua",
                placeholder: `A foto deve atender as seguintes orientações:
- sem óculos de sol
- sem chapéu
- sem boné
- sem lenço na cabeça`,
                type: "photo",
                isMultiple: false,
                required: true,
                helperText: "Foto de perfil com boa iluminação",
                grid: 12
              },
              {
                id: "field-envio-documento",
                name: "envio_documento",
                label: "Envie-nos também um documento (de preferência com foto)",
                placeholder: `Documentos aceitos:
- RG
- CNH
- CPF
- outro documento com foto`,
                type: "photo",
                isMultiple: true,
                required: true,
                helperText: "Foto frente e verso do documento",
                grid: 12
              }
            ]
          }
        ]
      };

      return HttpResponse.json(form, { status: 200 });
    }
  ),

  http.get("http://localhost:3001/api/reports", ({ request }) => {
    const url = new URL(request.url);
    const payload = paginate(mockReports, url);
    return HttpResponse.json(payload, { status: 200 });
  }),

  // GET - Obter relatório específico
  http.get("http://localhost:3001/api/reports/:id", ({ params }) => {
    const id = params.id as string;
    const report = mockReportDetails.find((r) => r.id === id);
    const columns = columnsMock;
    if (report) {
      return HttpResponse.json(
        { report, columns, total: report.rows.length, page: 1, pageLimit: 0 },
        { status: 200 }
      );
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

  // ---- Endpoints de Notificações ----
  http.get("http://localhost:3001/api/notifications", () => {
    return HttpResponse.json(mockNotifications, { status: 200 });
  }),

  http.post("http://localhost:3001/api/notifications/mark-all-read", async ({ request }) => {
    try {
      const body = (await request.json()) as { ids?: Array<number | string> };
      const ids = (body?.ids ?? []).map((v) => Number(v));
      if (ids.length) {
        for (const n of mockNotifications) {
          if (ids.includes(Number(n.id))) n.read = true;
        }
      } else {
        // se não enviar ids, marca todas
        mockNotifications.forEach((n) => (n.read = true));
      }
      return HttpResponse.json({ success: true }, { status: 200 });
    } catch {
      return HttpResponse.json({ success: false }, { status: 400 });
    }
  }),

  http.post("http://localhost:3001/api/notifications/:id/read", ({ params }) => {
    const id = Number(params.id as string);
    const item = mockNotifications.find((n) => n.id === id);
    if (item) {
      item.read = true;
      return HttpResponse.json({ success: true }, { status: 200 });
    }
    return HttpResponse.json({ error: "Notification not found" }, { status: 404 });
  }),

  // ---- SSE: envia 1 notificação/minuto por 3 vezes ----
  http.get("http://localhost:3001/api/notifications/stream", ({ request }) => {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        // Dica de reconexão do SSE
        controller.enqueue(encoder.encode("retry: 10000\n\n"));
        let sent = 0;
        const origins: MockNotification["origin"][] = [
          "payment_confirmed",
          "family_filled",
          "registration_completed",
        ];

        // Heartbeat para manter a conexão viva
        const keepAlive = setInterval(() => {
          controller.enqueue(encoder.encode(":\n\n"));
        }, 15000);

        const timer = setInterval(() => {
          // Verifica se já temos 10 notificações no total
          if (mockNotifications.length >= 10) {
            clearInterval(timer);
            clearInterval(keepAlive);
            try {
              controller.close();
            } catch {}
            return;
          }

          const origin = origins[sent % origins.length];
          const retreatIds = (mockRetreats || []).map((r) => r.id) as number[];
          const retreatId =
            retreatIds.length > 0
              ? retreatIds[Math.floor(Math.random() * retreatIds.length)]
              : 1;

          const notif = createByOrigin(origin, retreatId);
          // adiciona ao topo
          mockNotifications.unshift(notif);

          // evento SSE
          controller.enqueue(encoder.encode("event: notification\n"));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(notif)}\n\n`));

          sent += 1;
          if (sent >= 3) {
            clearInterval(timer);
            clearInterval(keepAlive);
            try {
              controller.close();
            } catch {}
          }
        }, 10_000); // 10s

        // Abort/cancel

        request?.signal?.addEventListener?.("abort", () => {
          clearInterval(timer);
          clearInterval(keepAlive);
          try {
            controller.close();
          } catch {}
        });
      },
      cancel() {
        // noop (garantido via abort acima)
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }),

  //fallback handler for unhandled requests
  http.all("http://localhost:3001/*", ({ request }) => {
    console.warn("⚠️ Unhandled request:", request.method, request.url);
    return HttpResponse.json({ error: "Endpoint not mocked" }, { status: 404 });
  }),
];
function createCredentialsForUser(
  user: UserObject
): import("msw").JsonBodyType {
  return {
    login: user.name + " login",
    email: user.email,
    emailVerified: Math.random() < 0.5, // Randomly true or false
  };
}
