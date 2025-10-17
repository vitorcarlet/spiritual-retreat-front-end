"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";

import { useModal } from "@/src/hooks/useModal";
import { useUrlFilters } from "@/src/hooks/useUrlFilters";
import getPermission from "@/src/utils/getPermission";
import apiClient from "@/src/lib/axiosClientInstance";

import FilterButton from "../../../filters/FilterButton";
import { getFilters } from "./getFilters";
import RetreatServiceTeamTable from "./RetreatServiceTeamTable";
import ServiceTeamDetails from "./ServiceTeamDetails";
import CreateServiceTeamForm from "./CreateServiceTeamForm";
import type { Items } from "./types";
import {
  RetreatsCardTableDateFilters,
  RetreatsCardTableFilters,
} from "../../types";
import AddParticipantToServiceTeamForm from "./AddParticipantToServiceTeamForm";
import LockServiceSpacesModal from "./LockServiceSpacesModal";

interface ServiceSpacesResponse {
  rows: ServiceSpace[] | ServiceSpace;
  total: number;
  page: number;
  pageLimit: number | "all";
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const getServiceSpaces = async (
  filters: TableDefaultFilters<
    RetreatsCardTableFilters & RetreatsCardTableDateFilters
  >,
  retreatId: string
): Promise<ServiceSpacesResponse> => {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageLimit =
    filters.pageLimit && filters.pageLimit > 0 ? filters.pageLimit : 12;

  const params: Record<string, unknown> = {
    page,
    pageSize: pageLimit,
  };

  if (filters.search) {
    params.q = filters.search;
  }

  const { data } = await apiClient.get(
    `/api/retreats/${retreatId}/service/spaces`,
    {
      params,
    }
  );

  const extractRows = (payload: unknown): ServiceSpace[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload as ServiceSpace[];
    if (typeof payload !== "object") return [];

    const source = payload as {
      rows?: ServiceSpace[];
      items?: ServiceSpace[];
      data?: ServiceSpace[];
      result?: ServiceSpace[];
    };

    if (Array.isArray(source.rows)) return source.rows;
    if (Array.isArray(source.items)) return source.items;
    if (Array.isArray(source.data)) return source.data;
    if (Array.isArray(source.result)) return source.result;

    return [];
  };

  const rows = extractRows(data);

  const total =
    (data &&
      typeof data === "object" &&
      (data as { total?: number; totalCount?: number; count?: number })
        .total) ??
    (data &&
      typeof data === "object" &&
      (data as { total?: number; totalCount?: number; count?: number })
        .totalCount) ??
    (data &&
      typeof data === "object" &&
      (data as { total?: number; totalCount?: number; count?: number })
        .count) ??
    rows.length;

  const responsePage =
    (data && typeof data === "object" && (data as { page?: number }).page) ??
    page;
  const responseLimit =
    (data &&
      typeof data === "object" &&
      (data as { pageLimit?: number; pageSize?: number }).pageLimit) ??
    (data &&
      typeof data === "object" &&
      (data as { pageLimit?: number; pageSize?: number }).pageSize) ??
    pageLimit;

  const hasNextPage =
    (data &&
      typeof data === "object" &&
      (data as { hasNextPage?: boolean }).hasNextPage) ??
    responsePage * responseLimit < total;

  const hasPrevPage =
    (data &&
      typeof data === "object" &&
      (data as { hasPrevPage?: boolean }).hasPrevPage) ??
    responsePage > 1;

  return {
    rows,
    total,
    page: responsePage,
    pageLimit: responseLimit,
    hasNextPage,
    hasPrevPage,
  };
};

interface RetreatServiceTeamProps {
  id: string;
}

export default function RetreatServiceTeam({
  id: retreatId,
}: RetreatServiceTeamProps) {
  const t = useTranslations();
  const tDetails = useTranslations("service-team-details");
  const modal = useModal();
  const session = useSession();
  const queryClient = useQueryClient();

  const { filters, updateFilters, activeFiltersCount, resetFilters } =
    useUrlFilters<TableDefaultFilters<RetreatsCardTableFilters>>({
      defaultFilters: {
        page: 1,
        pageLimit: 12,
      },
      excludeFromCount: ["page", "pageLimit"],
    });

  const [hasCreatePermission, setHasCreatePermission] = useState(false);
  const [spacesReorderFlag, setSpacesReorderFlag] = useState(false);

  useEffect(() => {
    if (session.data?.user) {
      setHasCreatePermission(
        getPermission({
          permissions: session.data.user.permissions,
          permission: "retreats.update",
          role: session.data.user.role,
        })
      );
    }
  }, [session.data]);

  const filtersConfig = getFilters();

  const {
    data: serviceSpacesResponse,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["retreat-service-spaces", retreatId, filters],
    queryFn: () => getServiceSpaces(filters, retreatId),
    staleTime: 60_000,
  });

  const serviceSpaces: ServiceSpace[] = useMemo(() => {
    if (!serviceSpacesResponse) {
      return [];
    }

    const { rows } = serviceSpacesResponse;

    if (Array.isArray(rows)) {
      return rows;
    }

    return rows ? [rows] : [];
  }, [serviceSpacesResponse]);

  const canEditServiceSpace = useMemo(() => {
    const user = session.data?.user;
    if (!user) {
      return false;
    }
    return getPermission({
      permissions: user.permissions,
      permission: "retreats.update",
      role: user.role,
    });
  }, [session.data]);

  const openServiceSpaceDetails = useCallback(
    (spaceId: string, startInEdit = false) => {
      const space = serviceSpaces.find((item) => item.id === spaceId);

      if (!space) {
        return;
      }

      modal.open({
        title: tDetails("title", {
          defaultMessage: "Service space {space}",
          space: space.name,
        }),
        size: "md",
        customRender() {
          return (
            <ServiceTeamDetails
              space={space}
              retreatId={retreatId}
              canEdit={canEditServiceSpace}
              startInEdit={startInEdit && canEditServiceSpace}
              onClose={modal.close}
              onUpdated={(updatedSpace) => {
                queryClient.setQueryData<ServiceSpacesResponse | undefined>(
                  ["retreat-service-spaces", retreatId, filters],
                  (previous) => {
                    if (!previous || !Array.isArray(previous.rows)) {
                      return previous;
                    }

                    return {
                      ...previous,
                      rows: previous.rows.map((row) =>
                        row.id === updatedSpace.id ? updatedSpace : row
                      ),
                    };
                  }
                );

                queryClient.invalidateQueries({
                  queryKey: ["retreat-service-spaces", retreatId],
                });
              }}
            />
          );
        },
      });
    },
    [
      modal,
      tDetails,
      retreatId,
      canEditServiceSpace,
      queryClient,
      filters,
      serviceSpaces,
    ]
  );

  const handleSaveReorder = useCallback(
    async (items: Items) => {
      const serviceSpacesById = new Map(
        serviceSpaces.map((space) => [String(space.id), space])
      );

      const membersIndex = new Map<string, ServiceSpaceMember>();
      serviceSpaces.forEach((space) => {
        space.members?.forEach((member) => {
          membersIndex.set(String(member.id), member);
        });
      });

      try {
        const spacesPayload = Object.entries(items).map(
          ([serviceSpaceId, memberIds]) => {
            const originalSpace = serviceSpacesById.get(serviceSpaceId);

            const members = memberIds.map((memberId, index) => {
              const member = membersIndex.get(String(memberId));
              return {
                registrationId: String(memberId),
                role: member?.role ?? "member",
                position: index,
              };
            });

            return {
              spaceId: serviceSpaceId,
              name: originalSpace?.name ?? serviceSpaceId,
              members,
            };
          }
        );

        await apiClient.put(`/api/retreats/${retreatId}/service/roster`, {
          retreatId,
          version: 0,
          spaces: spacesPayload,
          ignoreWarnings: true,
        });

        queryClient.invalidateQueries({
          queryKey: ["retreat-service-spaces", retreatId],
        });
      } catch (error) {
        console.error("Failed to save service space reorder", error);
        queryClient.invalidateQueries({
          queryKey: ["retreat-service-spaces", retreatId],
        });
        throw error;
      } finally {
        setSpacesReorderFlag(false);
      }
    },
    [queryClient, retreatId, serviceSpaces, setSpacesReorderFlag]
  );

  const handleView = useCallback(
    (spaceId: UniqueIdentifier) => {
      openServiceSpaceDetails(String(spaceId), false);
    },
    [openServiceSpaceDetails]
  );

  const handleEdit = useCallback(
    (spaceId: UniqueIdentifier) => {
      openServiceSpaceDetails(String(spaceId), true);
    },
    [openServiceSpaceDetails]
  );

  const handleDelete = useCallback(
    async (spaceId: UniqueIdentifier) => {
      const spaceKey = String(spaceId);
      const confirmed = window.confirm(
        t("confirmDelete", {
          defaultMessage: "Are you sure you want to delete this service space?",
        })
      );

      if (!confirmed) {
        return;
      }

      try {
        await apiClient.delete(
          `/api/retreats/${retreatId}/service/spaces/${spaceKey}`
        );

        queryClient.setQueryData<ServiceSpacesResponse | undefined>(
          ["retreat-service-spaces", retreatId, filters],
          (previous) => {
            if (!previous || !Array.isArray(previous.rows)) {
              return previous;
            }

            return {
              ...previous,
              rows: previous.rows.filter((row) => row.id !== spaceKey),
              total: Math.max(0, (previous.total || 0) - 1),
            };
          }
        );

        queryClient.invalidateQueries({
          queryKey: ["retreat-service-spaces", retreatId],
        });
      } catch (error) {
        console.error("Failed to delete service space", error);
      }
    },
    [t, retreatId, queryClient, filters]
  );

  const handleAddNewParticipant = () => {
    modal.open({
      title: t("add-participant-in-service-team"),
      size: "md",
      customRender() {
        return (
          <AddParticipantToServiceTeamForm
            retreatId={retreatId}
            serviceSpaces={serviceSpaces}
            onSuccess={() => {
              modal.close?.();
              // Refetch families data
              // queryClient.invalidateQueries(["retreat-families", filters]);
            }}
          />
        );
      },
    });
  };

  const handleCreate = useCallback(() => {
    modal.open({
      title: t("createSpace.title", {
        defaultMessage: "Create service space",
      }),
      size: "md",
      customRender() {
        return (
          <CreateServiceTeamForm
            retreatId={retreatId}
            onSuccess={() => {
              modal.close?.();
              queryClient.invalidateQueries({
                queryKey: ["retreat-service-spaces", retreatId],
              });
            }}
          />
        );
      },
    });
  }, [modal, queryClient, retreatId, t]);

  const handleLockServiceSpaces = useCallback(() => {
    modal.open({
      title: tDetails("lock.title", {
        defaultMessage: "Lock service teams",
      }),
      size: "md",
      customRender() {
        return (
          <LockServiceSpacesModal
            retreatId={retreatId}
            serviceSpaces={serviceSpaces}
            onCancel={modal.close}
            onSuccess={() => {
              modal.close?.();
              queryClient.invalidateQueries({
                queryKey: ["retreat-service-spaces", retreatId],
              });
            }}
          />
        );
      },
    });
  }, [modal, queryClient, retreatId, serviceSpaces, tDetails]);

  const handleFiltersChange = useCallback(
    (newFilters: TableDefaultFilters<RetreatsCardTableFilters>) => {
      updateFilters({ ...filters, ...newFilters });
    },
    [filters, updateFilters]
  );

  const handleApplyFilters = useCallback(
    (newFilters: Partial<TableDefaultFilters<RetreatsCardTableFilters>>) => {
      updateFilters({ ...filters, ...newFilters });
    },
    [filters, updateFilters]
  );

  if (isLoading && !serviceSpacesResponse) {
    return (
      <Typography>
        {t("loading", { defaultMessage: "Loading service spaces..." })}
      </Typography>
    );
  }

  if (isError) {
    return (
      <Typography color="error">
        {t("error", { defaultMessage: "Unable to load service spaces." })}
      </Typography>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: 4,
        pt: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <FilterButton<
          TableDefaultFilters<RetreatsCardTableFilters>,
          RetreatsCardTableDateFilters
        >
          filters={filtersConfig}
          defaultValues={filters}
          onApplyFilters={handleApplyFilters}
          onReset={resetFilters}
          activeFiltersCount={activeFiltersCount}
        />

        {hasCreatePermission && (
          <>
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={isFetching || spacesReorderFlag}
            >
              {tDetails("create-new-team")}
            </Button>
            <Button
              variant="contained"
              onClick={handleAddNewParticipant}
              disabled={isFetching || spacesReorderFlag}
            >
              {tDetails("add-new-participant")}
            </Button>
            <Button
              variant="contained"
              onClick={handleLockServiceSpaces}
              disabled={isFetching || spacesReorderFlag}
            >
              {tDetails("lock.button", {
                defaultMessage: "Lock service teams",
              })}
            </Button>
          </>
        )}
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, position: "relative" }}>
        {serviceSpacesResponse && (
          <RetreatServiceTeamTable
            items={serviceSpaces}
            retreatId={retreatId}
            canEditServiceTeam={canEditServiceSpace}
            setServiceTeamReorderFlag={setSpacesReorderFlag}
            total={serviceSpacesResponse.total}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={canEditServiceSpace ? handleDelete : undefined}
            canEdit={canEditServiceSpace}
            onSaveReorder={canEditServiceSpace ? handleSaveReorder : undefined}
            setReorderFlag={
              canEditServiceSpace ? setSpacesReorderFlag : undefined
            }
          />
        )}

        {isFetching && (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              position: "absolute",
              inset: 0,
              backgroundColor: (theme) => `${theme.palette.background.paper}CC`,
              zIndex: (theme) => theme.zIndex.modal - 1,
            }}
          >
            <CircularProgress />
          </Stack>
        )}
      </Box>
    </Container>
  );
}
