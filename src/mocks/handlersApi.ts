import { http, HttpResponse } from "msw";
import {
  createOutboxHandlers,
  createRandomId,
  ensureFamilyGroups,
  getGroupsSummary,
  mockFamilyGroupsByRetreat,
  normalizeOptionalServiceSpaceMember,
  normalizeServiceSpaceMember,
  paginate,
  ServiceSpaceMemberInput,
} from "./shared";
import { mockFamilies } from "./handlerData/retreats/families";
import { mockContemplatedParticipants } from "./handlerData/retreats/contemplated";
import { mockRetreats } from "./handlerData/dashboard";
import {
  addServiceSpace,
  deleteServiceSpace,
  MockServiceSpace,
  mockServiceSpaces,
} from "./handlerData/retreats/serviceSpaces";

export const handlersApi = [
  // Send message to families endpoint
  http.post(
    "http://localhost:5000/api/admin/retreats/{retreatId}/groups",
    async ({ request }) => {
      const body = (await request.json()) as {
        subject: string;
        message: string;
        messageType: "email" | "sms" | "notification";
      };

      return HttpResponse.json(
        {
          success: true,
          message: `Mensagem enviada para todas as família com sucesso`,
          data: {
            messageType: body.messageType,
          },
        },
        { status: 200 }
      );
    }
  ),

  http.post(
    "http://localhost:5000/api/admin/retreats/{retreatId}/groups/{familyId}/notify",
    async ({ request, params }) => {
      const body = (await request.json()) as {
        subject: string;
        message: string;
        messageType: "email" | "sms" | "notification";
      };

      return HttpResponse.json(
        {
          success: true,
          message: `Mensagem enviada para a família ${params.familyId} com sucesso`,
          data: {
            messageType: body.messageType,
          },
        },
        { status: 200 }
      );
    }
  ),

  http.get(
    "http://localhost:5000/api/admin/retreats/:retreatId/groups",
    ({ params, request }) => {
      const retreatId = params.retreatId as string;
      const url = new URL(request.url);
      const statusFilter = url.searchParams.get("status");
      const groups = ensureFamilyGroups(retreatId);

      const items = statusFilter
        ? groups.filter((group) => group.groupStatus === statusFilter)
        : groups;

      return HttpResponse.json(
        {
          items,
        },
        { status: 200 }
      );
    }
  ),

  http.get(
    "http://localhost:5000/api/admin/retreats/:retreatId/groups/status",
    ({ params }) => {
      const retreatId = params.retreatId as string;
      const groups = ensureFamilyGroups(retreatId);
      const summary = getGroupsSummary(groups);

      return HttpResponse.json(summary, { status: 200 });
    }
  ),

  http.post(
    "http://localhost:5000/api/admin/retreats/:retreatId/groups/:familyId/resend",
    ({ params }) => {
      const retreatId = params.retreatId as string;
      const familyId = params.familyId as string;
      const groups = ensureFamilyGroups(retreatId);
      const group = groups.find((item) => item.familyId === familyId);

      if (!group) {
        return HttpResponse.json(
          { error: "Família não encontrada para reenviar." },
          { status: 404 }
        );
      }

      group.groupLastNotifiedAt = new Date().toISOString();
      group.groupVersion = (group.groupVersion ?? 0) + 1;
      if (group.groupStatus === "creating") {
        group.groupStatus = "active";
      }

      mockFamilyGroupsByRetreat.set(retreatId, groups);

      return HttpResponse.json(
        {
          success: true,
          message: "Notificação reenviada com sucesso.",
        },
        { status: 200 }
      );
    }
  ),

  http.post(
    "http://localhost:5000/api/admin/retreats/:retreatId/groups/retry-failed",
    ({ params }) => {
      const retreatId = params.retreatId as string;
      const groups = ensureFamilyGroups(retreatId);
      let processed = 0;

      groups.forEach((group) => {
        if (group.groupStatus === "failed") {
          group.groupStatus = "creating";
          group.groupLink = null;
          group.groupExternalId = null;
          group.groupChannel = null;
          group.groupCreatedAt = null;
          group.groupLastNotifiedAt = null;
          group.groupVersion = null;
          processed += 1;
        }
      });

      mockFamilyGroupsByRetreat.set(retreatId, groups);

      return HttpResponse.json(
        {
          success: true,
          message: processed
            ? `${processed} grupo(s) reenfileirado(s) para recriação.`
            : "Nenhum grupo pendente para reenfileirar.",
        },
        { status: 200 }
      );
    }
  ),
  ...createOutboxHandlers("http://localhost:5000/api/admin/outbox"),
  ...createOutboxHandlers("http://localhost:5000/admin/outbox"),
  http.post(
    "http://localhost:5000/api/admin/notifications/retreats/:retreatId/notify-selected",
    async ({ params, request }) => {
      const retreatId = params.retreatId as string;
      const body = (await request.json()) as {
        participantIds?: string[];
        messageText?: string;
        messageHtml?: string;
        channels?: {
          whatsapp?: boolean;
          email?: boolean;
          sms?: boolean;
        };
      };

      return HttpResponse.json(
        {
          success: true,
          message: `Mensagens para o retiro ${retreatId} enfileiradas com sucesso`,
          data: {
            totalParticipants:
              body.participantIds?.length ?? mockFamilies.length,
            channels: body.channels,
          },
        },
        { status: 200 }
      );
    }
  ),

  http.post(
    "http://localhost:5000/api/admin/notifications/registrations/:registrationId/notify",
    async ({ params }) => {
      const registrationId = params.registrationId as string;

      return HttpResponse.json(
        {
          success: true,
          message: `Notificação enviada para a inscrição ${registrationId}`,
        },
        { status: 200 }
      );
    }
  ),
  http.post("http://localhost:5000/api/Registrations", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body, { status: 200 });
  }),

  http.get("http://localhost:5000/api/Registrations", ({ request }) => {
    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status");

    let filteredParticipants = mockContemplatedParticipants;

    // Filter by status if provided (0 = not_contemplated, 1 = contemplated)
    if (statusParam !== null) {
      const statusValue = Number.parseInt(statusParam, 10);
      filteredParticipants = mockContemplatedParticipants.filter((p) => {
        const isContemplated = p.status === "contemplated";
        return statusValue === 1 ? isContemplated : !isContemplated;
      });
    }

    const payload = paginate(filteredParticipants, url);
    return HttpResponse.json(payload, { status: 200 });
  }),

  http.get("http://localhost:5000/api/Registrations/:id", ({ params }) => {
    const id = Number(params.id);
    const participant = mockContemplatedParticipants.find((p) => p.id === id);

    if (participant) {
      return HttpResponse.json(participant, { status: 200 });
    }

    return HttpResponse.json(
      { error: "Participante não encontrado" },
      { status: 404 }
    );
  }),

  http.post(
    "http://localhost:5000/api/retreats/:id/families/generate",
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
    "http://localhost:5000/api/retreats/:id/families",
    ({ request /*, params */ }) => {
      const url = new URL(request.url);
      const payload = paginate(mockFamilies, url);
      return HttpResponse.json(payload, { status: 200 });
    }
  ),

  // Reorder families and members endpoint
  http.put(
    "http://localhost:5000/api/retreats/:id/families",
    async ({ params, request }) => {
      const retreatId = params.id as string;
      const body = (await request.json()) as {
        retreatId: string;
        version: number;
        families: Array<{
          familyId: string;
          name: string;
          capacity: number;
          members: Array<{
            registrationId: string;
            position: number;
          }>;
        }>;
        ignoreWarnings: boolean;
      };

      return HttpResponse.json(
        {
          success: true,
          message: "Famílias reordenadas com sucesso",
          data: {
            retreatId,
            updatedFamilies: body.families.length,
            version: body.version + 1,
          },
        },
        { status: 200 }
      );
    }
  ),

  // Get single family by ID
  http.get(
    "http://localhost:5000/api/retreats/:retreatId/families/:familyId",
    ({ params }) => {
      const familyId = Number(params.familyId);
      const family = mockFamilies.find((f) => f.id === familyId);

      if (family) {
        return HttpResponse.json(family, { status: 200 });
      }

      return HttpResponse.json(
        { error: "Família não encontrada" },
        { status: 404 }
      );
    }
  ),

  //Delete Family By Id
  http.delete(
    "http://localhost:5000/api/retreats/:retreatId/families/:familyId",
    ({ params }) => {
      const familyId = Number(params.familyId);
      const family = mockFamilies.find((f) => f.id === familyId);

      if (family) {
        return HttpResponse.json("familia deletada com sucesso", {
          status: 200,
        });
      }

      return HttpResponse.json(
        { error: "Família não encontrada" },
        { status: 404 }
      );
    }
  ),

  // Get lock status for all families in a retreat

  // Lock/Unlock all families in a retreat (global lock)
  http.post(
    "http://localhost:5000/api/retreats/:retreatId/families/lock",
    async ({ params, request }) => {
      const retreatId = params.retreatId as string;
      const body = (await request.json()) as { lock: boolean };

      // Update all families lock status
      mockFamilies.forEach((family) => {
        family.locked = body.lock;
      });

      // Update groups status if needed
      const groups = ensureFamilyGroups(retreatId);
      groups.forEach((group) => {
        group.groupStatus = body.lock ? "locked" : "active";
      });

      return HttpResponse.json(
        {
          version: 0,
          locked: body.lock,
        },
        { status: 200 }
      );
    }
  ),

  // Lock/Unlock a specific family
  http.post(
    "http://localhost:5000/api/retreats/:retreatId/families/:familyId/lock",
    async ({ params, request }) => {
      const familyId = Number(params.familyId);
      const body = (await request.json()) as { lock: boolean };

      const family = mockFamilies.find((f) => f.id === familyId);

      if (!family) {
        return HttpResponse.json(
          { error: "Família não encontrada" },
          { status: 404 }
        );
      }

      family.locked = body.lock;

      return HttpResponse.json(
        {
          version: 0,
          locked: body.lock,
        },
        { status: 200 }
      );
    }
  ),

  // Get unassigned participants for a retreat
  http.get(
    "http://localhost:5000/api/retreats/:retreatId/families/unassigned",
    ({ request }) => {
      const url = new URL(request.url);
      const gender = url.searchParams.get("gender");
      const city = url.searchParams.get("city");
      const search = url.searchParams.get("search");

      const mockUnassignedParticipants = [
        {
          registrationId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          name: "João Silva",
          gender: "Masculino",
          city: "São Paulo",
          email: "joao.silva@email.com",
        },
        {
          registrationId: "4fb96f75-6828-5673-c4gd-3d074g77bgb7",
          name: "Maria Santos",
          gender: "Feminino",
          city: "Rio de Janeiro",
          email: "maria.santos@email.com",
        },
        {
          registrationId: "5gc07g86-7939-6784-d5he-4e185h88chc8",
          name: "Pedro Oliveira",
          gender: "Masculino",
          city: "Belo Horizonte",
          email: "pedro.oliveira@email.com",
        },
        {
          registrationId: "6hd18h97-8a4a-7895-e6if-5f296i99did9",
          name: "Ana Costa",
          gender: "Feminino",
          city: "Porto Alegre",
          email: "ana.costa@email.com",
        },
        {
          registrationId: "7ie29ia8-9b5b-89a6-f7jg-6g3a7ja0eje0",
          name: "Carlos Pereira",
          gender: "Masculino",
          city: "Salvador",
          email: "carlos.pereira@email.com",
        },
        {
          registrationId: "8jf3ajb9-ac6c-9ab7-g8kh-7h4b8kb1fkf1",
          name: "Fernanda Lima",
          gender: "Feminino",
          city: "Brasília",
          email: "fernanda.lima@email.com",
        },
        {
          registrationId: "9kg4bkc0-bd7d-abc8-h9li-8i5c9lc2glg2",
          name: "Ricardo Mendes",
          gender: "Masculino",
          city: "Curitiba",
          email: "ricardo.mendes@email.com",
        },
        {
          registrationId: "alh5cld1-ce8e-bcd9-iamj-9j6damd3hmh3",
          name: "Juliana Ferreira",
          gender: "Feminino",
          city: "Fortaleza",
          email: "juliana.ferreira@email.com",
        },
        {
          registrationId: "bmi6dme2-df9f-cdea-jbnk-ak7ebne4ini4",
          name: "Rafael Alves",
          gender: "Masculino",
          city: "Recife",
          email: "rafael.alves@email.com",
        },
        {
          registrationId: "cnj7enf3-eg0g-defb-kcol-bl8fcof5joj5",
          name: "Luciana Rocha",
          gender: "Feminino",
          city: "Goiânia",
          email: "luciana.rocha@email.com",
        },
      ];

      let filteredParticipants = mockUnassignedParticipants;

      // Apply filters
      if (gender) {
        filteredParticipants = filteredParticipants.filter((p) =>
          p.gender.toLowerCase().includes(gender.toLowerCase())
        );
      }

      if (city) {
        filteredParticipants = filteredParticipants.filter((p) =>
          p.city.toLowerCase().includes(city.toLowerCase())
        );
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredParticipants = filteredParticipants.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.email.toLowerCase().includes(searchLower)
        );
      }

      return HttpResponse.json(
        { items: filteredParticipants },
        { status: 200 }
      );
    }
  ),

  // Reset all families
  http.post(
    "http://localhost:5000/api/retreats/:retreatId/families/reset",
    async ({ request }) => {
      const body = (await request.json()) as { forceLockedFamilies: boolean };

      // Count families and members before deletion
      const familiesToDelete = body.forceLockedFamilies
        ? mockFamilies
        : mockFamilies.filter((f) => !f.locked);

      const familiesDeleted = familiesToDelete.length;
      const membersDeleted = familiesToDelete.reduce(
        (sum, family) => sum + (family.members?.length || 0),
        0
      );

      // If not forcing, check if there are locked families
      const hasLockedFamilies = mockFamilies.some((f) => f.locked);

      if (hasLockedFamilies && !body.forceLockedFamilies) {
        return HttpResponse.json(
          {
            error:
              "Existem famílias trancadas. Use forceLockedFamilies=true para resetar todas as famílias.",
          },
          { status: 400 }
        );
      }

      // Reset families (in real implementation, this would delete from database)
      // For mock, we'll clear the members array
      if (body.forceLockedFamilies) {
        // Reset all families
        mockFamilies.forEach((family) => {
          family.members = [];
          family.locked = false;
        });
      } else {
        // Only reset unlocked families
        mockFamilies
          .filter((f) => !f.locked)
          .forEach((family) => {
            family.members = [];
          });
      }

      return HttpResponse.json(
        {
          version: 0,
          familiesDeleted,
          membersDeleted,
        },
        { status: 200 }
      );
    }
  ),

  // Family creation endpoint
  http.post(
    "http://localhost:5000/api/retreats/:id/create/families",
    async ({ request }) => {
      const body = (await request.json()) as {
        name: string;
        description?: string;
        maxMembers: number;
        tentNumber?: string;
        sector?: string;
      };

      return HttpResponse.json(
        {
          success: true,
          data: {
            id: Math.random().toString(36).substr(2, 9),
            ...body,
            members: [],
            createdAt: new Date().toISOString(),
          },
        },
        { status: 201 }
      );
    }
  ),

  //RetreatLottery

  // Lottery preview - show which participants would be selected
  http.get(
    "http://localhost:5000/api/retreats/:retreatId/lottery/preview",
    () => {
      // Get contemplated participants
      const contemplated = mockContemplatedParticipants.filter(
        (p) => p.status === "contemplated"
      );

      // Separate by gender (mock - assuming we have gender data)
      const maleParticipants = contemplated
        .filter((_, index) => index % 2 === 0) // Mock: alternate genders
        .map((p) => String(p.id));

      const femaleParticipants = contemplated
        .filter((_, index) => index % 2 === 1) // Mock: alternate genders
        .map((p) => String(p.id));

      // Mock capacity limits
      const maleCap = Math.max(maleParticipants.length + 5, 20);
      const femaleCap = Math.max(femaleParticipants.length + 5, 20);

      return HttpResponse.json(
        {
          male: maleParticipants,
          female: femaleParticipants,
          maleCap,
          femaleCap,
        },
        { status: 200 }
      );
    }
  ),

  // Lottery commit - confirm the lottery selection
  http.post(
    "http://localhost:5000/api/retreats/:retreatId/lottery/commit",
    () => {
      // Get contemplated participants
      const contemplated = mockContemplatedParticipants.filter(
        (p) => p.status === "contemplated"
      );

      // Separate by gender (mock - assuming we have gender data)
      const maleParticipants = contemplated
        .filter((_, index) => index % 2 === 0) // Mock: alternate genders
        .map((p) => String(p.id));

      const femaleParticipants = contemplated
        .filter((_, index) => index % 2 === 1) // Mock: alternate genders
        .map((p) => String(p.id));

      // Mock capacity limits
      const maleCap = Math.max(maleParticipants.length + 5, 20);
      const femaleCap = Math.max(femaleParticipants.length + 5, 20);
      //const arr = ['1231',123,'asdas',{ggg: 11}]
      // In a real scenario, this would update the database
      // For now, just return the same data as preview
      return HttpResponse.json(
        {
          male: maleParticipants,
          female: femaleParticipants,
          maleCap,
          femaleCap,
        },
        { status: 200 }
      );
    }
  ),

  // Contemplate a participant (mark as selected for retreat)
  http.post(
    "http://localhost:5000/api/retreats/:retreatId/selections/:registrationId",
    ({ params }) => {
      const { retreatId, registrationId } = params;

      // Find the participant in mock data
      const participantIndex = mockContemplatedParticipants.findIndex(
        (p) => String(p.id) === String(registrationId)
      );

      if (participantIndex === -1) {
        return HttpResponse.json(
          { error: "Participante não encontrado" },
          { status: 404 }
        );
      }

      // Update the participant status to contemplated (status = 1)
      mockContemplatedParticipants[participantIndex] = {
        ...mockContemplatedParticipants[participantIndex],
        status: "contemplated",
      };

      return HttpResponse.json(
        {
          message: "Participante contemplado com sucesso",
          retreatId,
          registrationId,
          status: "contemplated",
        },
        { status: 200 }
      );
    }
  ),

  // Remove contemplation from a participant
  http.delete(
    "http://localhost:5000/api/retreats/:retreatId/selections/:registrationId",
    ({ params }) => {
      const { retreatId, registrationId } = params;

      // Find the participant in mock data
      const participantIndex = mockContemplatedParticipants.findIndex(
        (p) => String(p.id) === String(registrationId)
      );

      if (participantIndex === -1) {
        return HttpResponse.json(
          { error: "Participante não encontrado" },
          { status: 404 }
        );
      }

      // Update the participant status to not_contemplated (status = 0)
      mockContemplatedParticipants[participantIndex] = {
        ...mockContemplatedParticipants[participantIndex],
        status: "not_contemplated",
      };

      return HttpResponse.json(
        {
          message: "Contemplação removida com sucesso",
          retreatId,
          registrationId,
          status: "not_contemplated",
        },
        { status: 200 }
      );
    }
  ),

  //Retreat

  http.post("http://localhost:5000/api/Retreats", async ({ request }) => {
    const contentType = request.headers.get("content-type");

    let payload: Record<string, unknown>;

    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();
      const payloadStr = formData.get("payload");
      payload = payloadStr ? JSON.parse(payloadStr as string) : {};
      // Images would be in formData.getAll("images") but we'll skip processing for mock
    } else {
      payload = (await request.json()) as Record<string, unknown>;
    }

    const newRetreat = {
      id:
        mockRetreats.length > 0
          ? Math.max(
              ...mockRetreats.map((r) => (typeof r.id === "number" ? r.id : 0))
            ) + 1
          : 1,
      title: (payload.title as string) || "Novo Retiro",
      edition: (payload.edition as number) || 1,
      state: "", // Will be derived from stateShort
      stateShort: (payload.stateShort as string) || "",
      city: (payload.city as string) || "",
      theme: (payload.theme as string) || "",
      description: (payload.description as string) || "",
      startDate: (payload.startDate as string) || "",
      endDate: (payload.endDate as string) || "",
      capacity: (payload.capacity as number) || 0,
      participationTax: (payload.participationTax as string) || "",
      enrolled: (payload.enrolled as number) || 0,
      location: (payload.location as string) || "",
      isActive: (payload.isActive as boolean) ?? true,
      images: (payload.images as string[]) || [],
      status:
        (payload.status as
          | "open"
          | "closed"
          | "running"
          | "ended"
          | "upcoming") || "upcoming",
      instructor: (payload.instructor as string) || "",
    };

    mockRetreats.push(newRetreat);

    return HttpResponse.json(newRetreat, { status: 201 });
  }),

  http.get(
    "http://localhost:5000/api/Retreats",
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
          list = list.filter((r) => r.name.toLowerCase().includes(search));
        }

        // Optional limit for autocomplete (default 20)
        const limit = parseInt(url.searchParams.get("limit") || "20", 10);
        const sliced = list.slice(0, isNaN(limit) ? 20 : limit);

        return HttpResponse.json(
          {
            options: sliced.map((r) => ({
              value: r.id,
              label: r.name,
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

  http.get("http://localhost:5000/api/Retreats/:id", ({ params }) => {
    const id = params.id as string;
    const retreat = mockRetreats.find((r) => r.id.toString() === id);
    if (retreat) {
      return HttpResponse.json(retreat, { status: 200 });
    }
    return HttpResponse.json({ error: "Retreat not found" }, { status: 404 });
  }),

  http.put(
    "http://localhost:5000/api/Retreats/:id",
    async ({ params, request }) => {
      const id = params.id as string;
      const contentType = request.headers.get("content-type");

      let payload: Record<string, unknown>;

      if (contentType?.includes("multipart/form-data")) {
        const formData = await request.formData();
        const payloadStr = formData.get("payload");
        payload = payloadStr ? JSON.parse(payloadStr as string) : {};
        // Images would be in formData.getAll("images") but we'll skip processing for mock
      } else {
        payload = (await request.json()) as Record<string, unknown>;
      }

      const index = mockRetreats.findIndex((r) => r.id.toString() === id);

      if (index === -1) {
        return HttpResponse.json(
          { error: "Retreat not found" },
          { status: 404 }
        );
      }

      const updatedRetreat = {
        ...mockRetreats[index],
        ...payload,
        id: mockRetreats[index].id, // Preserve original ID
      };

      mockRetreats[index] = updatedRetreat;

      return HttpResponse.json(updatedRetreat, { status: 200 });
    }
  ),

  http.delete("http://localhost:5000/api/Retreats/:id", ({ params }) => {
    const id = params.id as string;
    const index = mockRetreats.findIndex((r) => r.id.toString() === id);

    if (index === -1) {
      return HttpResponse.json({ error: "Retreat not found" }, { status: 404 });
    }

    const deletedRetreat = mockRetreats[index];
    mockRetreats.splice(index, 1);

    return HttpResponse.json(
      {
        message: `Retiro "${deletedRetreat.name}" excluído com sucesso`,
        id: deletedRetreat.id,
      },
      { status: 200 }
    );
  }),

  // Service Alerts for retreat service teams
  http.get(
    "http://localhost:5000/api/retreats/:retreatId/service/alerts",
    ({ params, request }) => {
      const retreatId = (params.retreatId as string) ?? "";
      const url = new URL(request.url);
      const mode = url.searchParams.get("mode");

      // Filter spaces by retreat
      const spaces = mockServiceSpaces.filter((s) => s.retreatId === retreatId);

      const payloadSpaces = spaces.map((space) => {
        const minPeople = Math.max(space.minMembers ?? 0, 0);
        const baseAssigned =
          (space.members?.length ?? 0) +
          (space.coordinator ? 1 : 0) +
          (space.viceCoordinator ? 1 : 0);
        const maxPeople = Math.max(minPeople + 3, baseAssigned + 1);

        const assignedCount = mode === "ok" ? minPeople : baseAssigned;
        const preferenceCount = 0; // no preference source in mocks yet

        const hasCoordinator = Boolean(space.coordinator);
        const hasVice = Boolean(space.viceCoordinator);

        const alerts: Array<{
          code: string;
          severity: string;
          message: string;
        }> = [];

        if (mode !== "ok") {
          if (!hasCoordinator) {
            alerts.push({
              code: "missing_coordinator",
              severity: "warning",
              message: "Equipe sem coordenador",
            });
          }
          if (!hasVice) {
            alerts.push({
              code: "missing_vice",
              severity: "info",
              message: "Equipe sem vice-coordenador",
            });
          }
          if (assignedCount === 0) {
            alerts.push({
              code: "no_members",
              severity: "warning",
              message: "Nenhum membro alocado",
            });
          }
          if (assignedCount < minPeople) {
            alerts.push({
              code: "below_min",
              severity: "warning",
              message: `Abaixo do mínimo (${assignedCount}/${minPeople})`,
            });
          }
          if (assignedCount > maxPeople) {
            alerts.push({
              code: "over_capacity",
              severity: "error",
              message: `Acima da capacidade (${assignedCount}/${maxPeople})`,
            });
          }
        }

        return {
          spaceId: space.id,
          name: space.name,
          minPeople,
          maxPeople,
          assignedCount,
          preferenceCount,
          hasCoordinator,
          hasVice,
          alerts,
        };
      });

      const response = {
        version: 0,
        generatedAtUtc: new Date().toISOString(),
        spaces: mode === "empty" ? [] : payloadSpaces,
      };

      return HttpResponse.json(response, { status: 200 });
    }
  ),

  // Service Registrations - Create
  http.post(
    "http://localhost:5000/api/retreats/:retreatId/service/registrations",
    async ({ request }) => {
      await request.json(); // consume body

      const serviceRegistrationId = `sreg-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      return HttpResponse.json(
        {
          serviceRegistrationId,
        },
        { status: 200 }
      );
    }
  ),

  // Service Registrations - Get by ID
  http.get(
    "http://localhost:5000/api/retreats/:retreatId/service/registrations/:id",
    ({ params }) => {
      const { retreatId, id } = params;

      // Mock registration data
      const registration = {
        id: id as string,
        retreatId: retreatId as string,
        fullName: "João da Silva Santos",
        cpf: "123.456.789-00",
        email: "joao.silva@example.com",
        phone: "+55 11 98765-4321",
        birthDate: "1990-05-15",
        gender: 0, // 0 = male, 1 = female
        city: "São Paulo",
        region: "SP",
        photoUrl: "https://i.pravatar.cc/150?img=12",
        status: 1, // 0 = pending, 1 = confirmed, etc.
        enabled: true,
        registrationDateUtc: new Date(Date.now() - 86400000 * 7).toISOString(),
        preferredSpace: {
          id: mockServiceSpaces[0]?.id ?? "space-1",
          name: mockServiceSpaces[0]?.name ?? "Casa da Mãe",
        },
      };

      return HttpResponse.json(registration, { status: 200 });
    }
  ),

  // Service Registrations - Roster
  http.get(
    "http://localhost:5000/api/retreats/:retreatId/service/registrations/roster",
    ({ params }) => {
      const retreatId = params.retreatId as string;

      const spaces = mockServiceSpaces
        .filter((s) => s.retreatId === retreatId)
        .map((space) => {
          const members = [
            ...(space.coordinator
              ? [
                  {
                    registrationId: space.coordinator.id,
                    name: space.coordinator.name,
                    role: 2, // 0 = member, 1 = support, 2 = coordinator
                    position: 0,
                    city: "São Paulo",
                  },
                ]
              : []),
            ...(space.viceCoordinator
              ? [
                  {
                    registrationId: space.viceCoordinator.id,
                    name: space.viceCoordinator.name,
                    role: 3, // 3 = vice-coordinator
                    position: 1,
                    city: "Campinas",
                  },
                ]
              : []),
            ...(space.members ?? []).map((member, idx) => ({
              registrationId: member.id,
              name: member.name,
              role: member.role === "support" ? 1 : 0,
              position: idx + 2,
              city: idx % 2 === 0 ? "Rio de Janeiro" : "Belo Horizonte",
            })),
          ];

          return {
            spaceId: space.id,
            name: space.name,
            description: space.description ?? "",
            minPeople: space.minMembers ?? 0,
            maxPeople: Math.max((space.minMembers ?? 0) + 5, members.length),
            isLocked: false,
            isActive: true,
            members,
          };
        });

      return HttpResponse.json(
        {
          version: 0,
          spaces,
        },
        { status: 200 }
      );
    }
  ),

  // Service Registrations - Roster Unassigned
  http.get(
    "http://localhost:5000/api/retreats/:retreatId/service/registrations/roster/unassigned",
    () => {
      const mockUnassigned = [
        {
          registrationId: "unreg-1",
          name: "Pedro Henrique Costa",
          city: "Curitiba",
          email: "pedro.costa@example.com",
          cpf: "111.222.333-44",
          preferredSpaceId: mockServiceSpaces[0]?.id ?? "space-1",
          preferredSpaceName: mockServiceSpaces[0]?.name ?? "Casa da Mãe",
        },
        {
          registrationId: "unreg-2",
          name: "Ana Paula Ferreira",
          city: "Porto Alegre",
          email: "ana.ferreira@example.com",
          cpf: "222.333.444-55",
          preferredSpaceId: mockServiceSpaces[1]?.id ?? "space-2",
          preferredSpaceName: mockServiceSpaces[1]?.name ?? "Casa do Pai",
        },
        {
          registrationId: "unreg-3",
          name: "Carlos Eduardo Almeida",
          city: "Salvador",
          email: "carlos.almeida@example.com",
          cpf: "333.444.555-66",
          preferredSpaceId: mockServiceSpaces[2]?.id ?? "space-3",
          preferredSpaceName: mockServiceSpaces[2]?.name ?? "Música",
        },
      ];

      return HttpResponse.json(
        {
          version: 0,
          items: mockUnassigned,
        },
        { status: 200 }
      );
    }
  ),

  // Service Registrations - Confirmed
  http.get(
    "http://localhost:5000/api/retreats/:retreatId/service/registrations/confirmed",
    () => {
      // Return 200 OK with empty response or minimal data
      return HttpResponse.json(
        {
          version: 0,
          items: [],
        },
        { status: 200 }
      );
    }
  ),

  http.get(
    "http://localhost:5000/api/retreats/:id/service/spaces/public",
    ({ request, params }) => {
      const url = new URL(request.url);
      const retreatId = params.id as string;
      const filtered = mockServiceSpaces.filter(
        (space) => space.retreatId === retreatId
      );
      const payload = paginate(filtered, url);
      return HttpResponse.json(payload, { status: 200 });
    }
  ),

  // Service Spaces - Summary
  http.get(
    "http://localhost:5000/api/retreats/:retreatId/service/spaces/summary",
    ({ params }) => {
      const retreatId = params.retreatId as string;
      const spaces = mockServiceSpaces.filter((s) => s.retreatId === retreatId);

      const totalSpaces = spaces.length;
      const activeSpaces = spaces.length; // all active by default in mocks
      const lockedSpaces = 0; // no lock property in mock type yet

      let totalMembers = 0;
      let totalCoordinators = 0;
      let totalViceCoordinators = 0;
      let spacesWithCoordinator = 0;
      let spacesWithViceCoordinator = 0;

      spaces.forEach((space) => {
        totalMembers += space.members?.length ?? 0;
        if (space.coordinator) {
          totalCoordinators += 1;
          spacesWithCoordinator += 1;
        }
        if (space.viceCoordinator) {
          totalViceCoordinators += 1;
          spacesWithViceCoordinator += 1;
        }
      });

      const summary = {
        totalSpaces,
        activeSpaces,
        lockedSpaces,
        totalMembers,
        totalCoordinators,
        totalViceCoordinators,
        spacesWithCoordinator,
        spacesWithViceCoordinator,
        averageMembersPerSpace:
          totalSpaces > 0
            ? Math.round((totalMembers / totalSpaces) * 10) / 10
            : 0,
      };

      return HttpResponse.json(summary, { status: 200 });
    }
  ),

  http.get(
    "http://localhost:5000/api/retreats/:id/service/spaces",
    ({ request, params }) => {
      const url = new URL(request.url);
      const retreatId = params.id as string;
      const filtered = mockServiceSpaces.filter(
        (space) => space.retreatId === retreatId
      );
      const payload = paginate(filtered, url);
      return HttpResponse.json(payload, { status: 200 });
    }
  ),

  http.post(
    "http://localhost:5000/api/retreats/:id/service/spaces",
    async ({ params, request }) => {
      const retreatId = params.id as string;
      const body = (await request.json()) as Partial<MockServiceSpace> & {
        members?: ServiceSpaceMemberInput[];
      };

      if (!body?.name || typeof body.name !== "string") {
        return HttpResponse.json(
          { error: "Nome do espaço é obrigatório" },
          { status: 400 }
        );
      }

      const minMembersValue = Math.max(
        1,
        Math.floor(typeof body.minMembers === "number" ? body.minMembers : 1)
      );

      const newSpace: MockServiceSpace = {
        id: createRandomId("service-space"),
        retreatId,
        color: "#1976d2",
        name: body.name,
        description:
          typeof body.description === "string" ? body.description : "",
        minMembers: minMembersValue,
        coordinator: normalizeOptionalServiceSpaceMember(
          body.coordinator as ServiceSpaceMemberInput | null | undefined,
          0,
          "Coordenador"
        ),
        viceCoordinator: normalizeOptionalServiceSpaceMember(
          body.viceCoordinator as ServiceSpaceMemberInput | null | undefined,
          1,
          "Vice responsável"
        ),
        members: Array.isArray(body.members)
          ? body.members.map((member, index) =>
              normalizeServiceSpaceMember(member, index, `Membro ${index + 1}`)
            )
          : [],
      };

      addServiceSpace(newSpace);

      return HttpResponse.json(
        { success: true, data: newSpace },
        { status: 201 }
      );
    }
  ),

  http.get(
    "http://localhost:5000/api/retreats/:id/service/spaces/:spaceId",
    ({ params }) => {
      const retreatId = params.id as string;
      const spaceId = params.spaceId as string;
      const space = mockServiceSpaces.find(
        (item) => item.id === spaceId && item.retreatId === retreatId
      );

      if (!space) {
        return HttpResponse.json(
          { error: "Service space not found" },
          { status: 404 }
        );
      }

      return HttpResponse.json({ success: true, data: space }, { status: 200 });
    }
  ),

  http.delete(
    "http://localhost:5000/api/retreats/:id/service-spaces/:spaceId",
    ({ params }) => {
      const retreatId = params.id as string;
      const spaceId = params.spaceId as string;

      const existingIndex = mockServiceSpaces.findIndex(
        (item) => item.id === spaceId && item.retreatId === retreatId
      );

      if (existingIndex === -1) {
        return HttpResponse.json(
          { error: "Service space não encontrado" },
          { status: 404 }
        );
      }

      deleteServiceSpace(spaceId);

      return HttpResponse.json({ success: true }, { status: 200 });
    }
  ),

  // Service Spaces - Set Capacity (bulk or individual)
  http.post(
    "http://localhost:5000/api/retreats/:retreatId/service/spaces/capacity",
    async ({ params, request }) => {
      const retreatId = params.retreatId as string;
      const body = (await request.json()) as {
        applyToAll: boolean;
        minPeople?: number;
        maxPeople?: number;
        items?: Array<{
          spaceId: string;
          minPeople: number;
          maxPeople: number;
        }>;
      };

      let updatedCount = 0;

      if (body.applyToAll) {
        // Apply minPeople/maxPeople to all spaces in retreat
        mockServiceSpaces.forEach((space) => {
          if (space.retreatId === retreatId) {
            if (typeof body.minPeople === "number") {
              space.minMembers = body.minPeople;
            }
            // Note: maxPeople is not in MockServiceSpace type,
            // but we'd store it in a real implementation
            updatedCount++;
          }
        });
      } else if (Array.isArray(body.items)) {
        // Apply capacity to specific spaces
        body.items.forEach((item) => {
          const space = mockServiceSpaces.find(
            (s) => s.id === item.spaceId && s.retreatId === retreatId
          );
          if (space) {
            space.minMembers = item.minPeople;
            // maxPeople would be stored if the type supported it
            updatedCount++;
          }
        });
      }

      return HttpResponse.json(
        {
          success: true,
          message: `Capacidade atualizada para ${updatedCount} espaço(s)`,
          updatedCount,
        },
        { status: 200 }
      );
    }
  ),

  // Service Spaces - Lock/Unlock individual space
  http.post(
    "http://localhost:5000/api/retreats/:retreatId/service/spaces/:spaceId/lock",
    async ({ params, request }) => {
      const retreatId = params.retreatId as string;
      const spaceId = params.spaceId as string;
      const body = (await request.json()) as { lock: boolean };

      const space = mockServiceSpaces.find(
        (s) => s.id === spaceId && s.retreatId === retreatId
      );

      if (!space) {
        return HttpResponse.json(
          { error: "Service space não encontrado" },
          { status: 404 }
        );
      }

      // Note: MockServiceSpace doesn't have a locked property yet
      // In a real implementation, we'd set space.locked = body.lock
      // For now, just return success

      return HttpResponse.json(
        {
          success: true,
          message: body.lock
            ? `Espaço ${space.name} trancado`
            : `Espaço ${space.name} destrancado`,
          locked: body.lock,
        },
        { status: 200 }
      );
    }
  ),

  // Service Spaces - Lock/Unlock all spaces in retreat
  http.post(
    "http://localhost:5000/api/retreats/:retreatId/service/spaces/lock",
    async ({ params, request }) => {
      const retreatId = params.retreatId as string;
      const body = (await request.json()) as { lock: boolean };

      let updatedCount = 0;

      mockServiceSpaces.forEach((space) => {
        if (space.retreatId === retreatId) {
          // Note: MockServiceSpace doesn't have a locked property yet
          // In a real implementation: space.locked = body.lock
          updatedCount++;
        }
      });

      return HttpResponse.json(
        {
          success: true,
          message: body.lock
            ? `${updatedCount} espaço(s) trancado(s)`
            : `${updatedCount} espaço(s) destrancado(s)`,
          updatedCount,
          locked: body.lock,
        },
        { status: 200 }
      );
    }
  ),

  // Service Roster - Update roster (reorder members across spaces)
  http.put(
    "http://localhost:5000/api/retreats/:retreatId/service/roster",
    async ({ params, request }) => {
      const retreatId = params.retreatId as string;
      const body = (await request.json()) as {
        retreatId: string;
        version: number;
        spaces: Array<{
          spaceId: string;
          name: string;
          members: Array<{
            registrationId: string;
            role: number;
            position: number;
          }>;
        }>;
        ignoreWarnings: boolean;
      };

      let updatedSpaces = 0;
      let updatedMembers = 0;

      // Update each space with new member roster
      body.spaces.forEach((spaceUpdate) => {
        const space = mockServiceSpaces.find(
          (s) => s.id === spaceUpdate.spaceId && s.retreatId === retreatId
        );

        if (space) {
          // In a real implementation, we'd update the members array
          // based on role assignments (0=member, 1=support, 2=coordinator, 3=vice)
          // For mock, just count the updates
          updatedSpaces++;
          updatedMembers += spaceUpdate.members.length;
        }
      });

      return HttpResponse.json(
        {
          success: true,
          message: "Roster atualizado com sucesso",
          data: {
            retreatId,
            updatedSpaces,
            updatedMembers,
            version: body.version + 1,
          },
        },
        { status: 200 }
      );
    }
  ),
];
