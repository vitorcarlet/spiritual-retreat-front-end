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
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import getPermission from "@/src/utils/getPermission";

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
  const response = await handleApiResponse<ServiceSpacesResponse>(
    await sendRequestServerVanilla.get(
      `/retreats/${retreatId}/service-spaces`,
      {
        params: filters,
      }
    )
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch service spaces");
  }

  return response.data;
};

interface RetreatServiceTeamProps {
  id: string;
}

export default function RetreatServiceTeam({
  id: retreatId,
}: RetreatServiceTeamProps) {
  const t = useTranslations("service-team");
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
      try {
        const reorderData = Object.entries(items).map(
          ([serviceSpaceId, memberIds]) => ({
            serviceSpaceId,
            memberIds: memberIds.map((memberId) => String(memberId)),
          })
        );

        await sendRequestServerVanilla.put(
          `/retreats/${retreatId}/service-spaces/reorder`,
          {
            data: reorderData,
          }
        );

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
    [queryClient, retreatId, setSpacesReorderFlag]
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
        const response = await handleApiResponse<{ success: boolean }>(
          await sendRequestServerVanilla.delete(
            `/retreats/${retreatId}/service-spaces/${spaceKey}`
          )
        );

        if (!response.success) {
          throw new Error(
            response.error || "Unable to delete the selected service space"
          );
        }

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
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={isFetching || spacesReorderFlag}
          >
            {t("createSpace.cta", {
              defaultMessage: "Create service space",
            })}
          </Button>
        )}
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, position: "relative" }}>
        {serviceSpacesResponse && (
          <RetreatServiceTeamTable
            spaces={serviceSpaces}
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
