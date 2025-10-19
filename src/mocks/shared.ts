import { http, HttpResponse } from "msw";
import { MockServiceSpaceMember } from "./handlerData/retreats/serviceSpaces";
import { mockFamilies } from "./handlerData/retreats/families";

export type LoginRequest = {
  email?: string;
  password?: string;
};

export function paginate<T>(items: T[], urlObj: URL) {
  const parseIntSafe = (value: string | null, fallback: number) => {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  const rawSkip = urlObj.searchParams.get("skip");
  const rawTake = urlObj.searchParams.get("take");
  const rawPage = urlObj.searchParams.get("page");
  const rawLimit = urlObj.searchParams.get("pageLimit");

  const hasSkipTake = rawSkip !== null || rawTake !== null;

  const pageLimitAll = !hasSkipTake && rawLimit === "all";

  const take = hasSkipTake
    ? Math.max(parseIntSafe(rawTake, 20), 1)
    : pageLimitAll
    ? items.length
    : Math.max(parseIntSafe(rawLimit, 10), 1);

  const skip = hasSkipTake
    ? Math.max(parseIntSafe(rawSkip, 0), 0)
    : Math.max((Math.max(parseIntSafe(rawPage, 1), 1) - 1) * take, 0);

  const start = Math.min(skip, Math.max(items.length, 0));
  const end = start + take;
  const slice = items.slice(start, end);

  const page = hasSkipTake
    ? Math.floor(skip / take) + 1
    : Math.max(parseIntSafe(rawPage, 1), 1);

  return {
    rows: slice,
    total: items.length,
    page,
    pageLimit: pageLimitAll ? "all" : take,
    hasNextPage: end < items.length,
    hasPrevPage: page > 1,
    skip,
    take,
  };
}

export type ServiceSpaceMemberInput = Partial<{
  id: string;
  name: string;
  role: "member" | "support";
}>;

export const createRandomId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export type MockFamilyGroupStatus = "none" | "creating" | "active" | "failed" | "locked";

export type MockFamilyGroup = {
  retreatId: string;
  familyId: string;
  name: string;
  groupStatus: MockFamilyGroupStatus;
  groupLink: string | null;
  groupExternalId: string | null;
  groupChannel: string | null;
  groupCreatedAt: string | null;
  groupLastNotifiedAt: string | null;
  groupVersion: number | null;
};

export const mockFamilyGroupsByRetreat = new Map<string, MockFamilyGroup[]>();

export const ensureFamilyGroups = (retreatId: string): MockFamilyGroup[] => {
  if (!mockFamilyGroupsByRetreat.has(retreatId)) {
    const statuses: MockFamilyGroupStatus[] = [
      "none",
      "creating",
      "active",
      "failed",
    ];
    const channels = ["WhatsApp", "Telegram", "Signal"];
    const groups = mockFamilies.map((family, index) => {
      const status = statuses[index % statuses.length];
      const hasGroup = status !== "none";
      const createdAt = hasGroup
        ? new Date(Date.now() - (index + 1) * 86_400_000).toISOString()
        : null;
      const lastNotifiedAt =
        hasGroup && status === "active"
          ? new Date(Date.now() - (index + 1) * 43_200_000).toISOString()
          : null;

      return {
        retreatId,
        familyId: String(family.id),
        name: family.name,
        groupStatus: status,
        groupLink: hasGroup
          ? `https://chat.example.com/${retreatId}/${family.id}`
          : null,
        groupExternalId: hasGroup ? `grp-${family.id}` : null,
        groupChannel: hasGroup ? channels[index % channels.length] : null,
        groupCreatedAt: createdAt,
        groupLastNotifiedAt: lastNotifiedAt,
        groupVersion: hasGroup ? 1 : null,
      } satisfies MockFamilyGroup;
    });

    mockFamilyGroupsByRetreat.set(retreatId, groups);
  }

  return mockFamilyGroupsByRetreat.get(retreatId) ?? [];
};

export const getGroupsSummary = (groups: MockFamilyGroup[]) => {
  return groups.reduce(
    (acc, group) => {
      acc.totalFamilies += 1;
      acc[group.groupStatus] += 1;
      return acc;
    },
    {
      totalFamilies: 0,
      none: 0,
      creating: 0,
      active: 0,
      failed: 0,
    } as Record<MockFamilyGroupStatus | "totalFamilies", number>
  );
};

export type MockOutboxStatus = "pending" | "processing" | "processed" | "failed" | "queued";

export interface MockOutboxHistoryEntry {
  id: string;
  status: MockOutboxStatus;
  timestamp: string;
  message?: string | null;
}

export interface MockOutboxItem {
  id: string;
  type: string;
  status: MockOutboxStatus;
  attempts: number;
  maxAttempts: number;
  processed: boolean;
  createdAt: string;
  processedAt: string | null;
  lastError: string | null;
  payload: Record<string, unknown>;
  history: MockOutboxHistoryEntry[];
}

export const mockOutboxItems: MockOutboxItem[] = Array.from({ length: 48 }).map((_, index) => {
  const id = createRandomId("outbox");
  const statusCycle: MockOutboxStatus[] = [
    "pending",
    "processing",
    "processed",
    "failed",
    "queued",
  ];
  const status = statusCycle[index % statusCycle.length];
  const attempts = status === "processed" ? 1 : Math.min(3, index % 5);
  const createdAt = new Date(Date.now() - index * 3_600_000).toISOString();
  const processedAt =
    status === "processed"
      ? new Date(Date.now() - index * 1_800_000).toISOString()
      : null;

  return {
    id,
    type: index % 2 === 0 ? "email" : "whatsapp",
    status,
    attempts,
    maxAttempts: 5,
    processed: status === "processed",
    createdAt,
    processedAt,
    lastError:
      status === "failed"
        ? "Falha ao enviar mensagem devido à indisponibilidade do serviço."
        : null,
    payload: {
      subject: `Notificação ${index + 1}`,
      recipient: `usuario${index + 1}@example.com`,
      body: `Conteúdo da mensagem ${index + 1}`,
    },
    history: [
      {
        id: createRandomId("hist"),
        status: "queued",
        timestamp: createdAt,
        message: "Mensagem adicionada à fila.",
      },
      {
        id: createRandomId("hist"),
        status,
        timestamp: processedAt ?? createdAt,
        message:
          status === "failed"
            ? "Tentativa de envio falhou."
            : status === "processed"
            ? "Mensagem processada com sucesso."
            : "Mensagem aguardando processamento.",
      },
    ],
  } satisfies MockOutboxItem;
});

export const getOutboxSummary = () => {
  const now = new Date();
  const lastProcessed = mockOutboxItems
    .filter((item) => item.processedAt)
    .sort((a, b) => Date.parse(b.processedAt ?? "") - Date.parse(a.processedAt ?? ""))[0];

  return {
    pending: mockOutboxItems.filter((item) => item.status === "pending").length,
    processed: mockOutboxItems.filter((item) => item.status === "processed").length,
    failed: mockOutboxItems.filter((item) => item.status === "failed").length,
    lastRunAt: now.toISOString(),
    lastSuccessAt: lastProcessed?.processedAt ?? null,
  };
};

export const paginateOutbox = (items: MockOutboxItem[], url: URL) => {
  const page = Math.max(parseInt(url.searchParams.get("page") ?? "1", 10), 1);
  const limit = Math.max(parseInt(url.searchParams.get("limit") ?? "50", 10), 1);
  const start = (page - 1) * limit;
  const sliced = items.slice(start, start + limit);

  return {
    items: sliced,
    total: items.length,
    page,
    pageLimit: limit,
  };
};

export const createOutboxHandlers = (baseUrl: string) => [
  http.get(`${baseUrl}/summary`, () => {
    return HttpResponse.json(getOutboxSummary(), { status: 200 });
  }),
  http.get(baseUrl, ({ request }) => {
    const url = new URL(request.url);
    let filtered = [...mockOutboxItems];

    const processedParam = url.searchParams.get("processed");
    if (processedParam === "true") {
      filtered = filtered.filter((item) => item.processed);
    }
    if (processedParam === "false") {
      filtered = filtered.filter((item) => !item.processed);
    }

    const statusParam = url.searchParams.get("status");
    if (statusParam) {
      filtered = filtered.filter((item) => item.status === statusParam);
    }

    const typeParam = url.searchParams.get("type");
    if (typeParam) {
      filtered = filtered.filter((item) => item.type === typeParam);
    }

    const startDate = url.searchParams.get("startDate");
    if (startDate) {
      const start = Date.parse(startDate);
      filtered = filtered.filter((item) => Date.parse(item.createdAt) >= start);
    }

    const endDate = url.searchParams.get("endDate");
    if (endDate) {
      const end = Date.parse(endDate) + 86_400_000; // include entire day
      filtered = filtered.filter((item) => Date.parse(item.createdAt) <= end);
    }

    const payload = paginateOutbox(filtered, url);
    return HttpResponse.json(payload, { status: 200 });
  }),
  http.get(`${baseUrl}/:id`, ({ params }) => {
    const { id } = params as { id: string };
    const item = mockOutboxItems.find((entry) => entry.id === id);

    if (!item) {
      return HttpResponse.json({ error: "Mensagem não encontrada." }, { status: 404 });
    }

    return HttpResponse.json(item, { status: 200 });
  }),
  http.post(`${baseUrl}/:id/requeue`, ({ params }) => {
    const { id } = params as { id: string };
    const item = mockOutboxItems.find((entry) => entry.id === id);

    if (!item) {
      return HttpResponse.json({ error: "Mensagem não encontrada." }, { status: 404 });
    }

    item.status = "pending";
    item.processed = false;
    item.processedAt = null;
    item.lastError = null;
    item.attempts = 0;
    item.history = [
      ...item.history,
      {
        id: createRandomId("hist"),
        status: "pending",
        timestamp: new Date().toISOString(),
        message: "Mensagem reenfileirada manualmente.",
      },
    ];

    return HttpResponse.json(
      {
        success: true,
        message: "Mensagem reenfileirada com sucesso.",
      },
      { status: 200 }
    );
  }),
];

export function normalizeServiceSpaceMember(
  input: ServiceSpaceMemberInput | undefined,
  fallbackIndex: number,
  fallbackLabel: string
): MockServiceSpaceMember {
  const label =
    typeof input?.name === "string" && input.name.trim()
      ? input.name.trim()
      : fallbackLabel;

  return {
    id:
      typeof input?.id === "string" && input.id.trim()
        ? input.id
        : createRandomId(`space-member-${fallbackIndex}`),
    name: label,
    role: input?.role === "support" ? "support" : "member",
  };
}

export function normalizeOptionalServiceSpaceMember(
  input: ServiceSpaceMemberInput | null | undefined,
  fallbackIndex: number,
  fallbackLabel: string
) {
  if (!input) {
    return null;
  }

  return normalizeServiceSpaceMember(input, fallbackIndex, fallbackLabel);
}
