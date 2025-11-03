"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  CircularProgress,
  Container,
  Button,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import apiClient from "@/src/lib/axiosClientInstance";
import {
  RetreatsCardTableDateFilters,
  RetreatsCardTableFilters,
} from "../../types";
import getPermission from "@/src/utils/getPermission";
import { useSession } from "next-auth/react";
import { useUrlFilters } from "@/src/hooks/useUrlFilters";
import { getFilters } from "./getFilters";
import { useTranslations } from "next-intl";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useModal } from "@/src/hooks/useModal";
import CreateTentBulkForm from "./CreateTentBulkForm";
import { Items } from "./types";
import TentDetails from "./TentDetails";
import LockTentsModal from "./LockTentsModal";
import TentsActionBar from "./TentsActionBar";
import RetreatTentsTable from "./RetreatTentsTable";

interface RetreatRequest {
  tents: RetreatLite[];
  version: number;
}

const getRetreats = async (
  filters: TableDefaultFilters<
    RetreatsCardTableFilters & RetreatsCardTableDateFilters
  >,
  retreatId: string
): Promise<RetreatRequest> => {
  try {
    const response = await apiClient.get<RetreatRequest>(
      `/retreats/${retreatId}/tents/roster`,
      {
        params: filters,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching retreat tents:", error);
    throw new Error("Failed to fetch tents");
  }
};

interface RetreatsProps {
  id: string;
}

export default function RetreatTents({ id: retreatId }: RetreatsProps) {
  const t = useTranslations("tents");
  // const t = useTranslations("tent-details");
  const { filters, updateFilters, activeFiltersCount, resetFilters } =
    useUrlFilters<TableDefaultFilters<RetreatsCardTableFilters>>({
      defaultFilters: {
        page: 1,
        pageLimit: 12,
      },
      excludeFromCount: ["page", "pageLimit"],
    });

  const session = useSession();
  const [hasCreatePermission, setHasCreatePermission] = useState(false);
  const [tentsReorderFlag, setTentsReorderFlag] = useState<boolean>(false);
  const modal = useModal();

  useEffect(() => {
    if (session.data && session.data.user) {
      setHasCreatePermission(
        getPermission({
          permissions: session.data.user.permissions,
          permission: "users.create",
          role: session.data.user.role,
        })
      );
    }
  }, [session.data]);

  const filtersConfig = getFilters();
  const queryClient = useQueryClient();
  const {
    data: tentsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["retreat-tents", filters],
    queryFn: () => getRetreats(filters, retreatId),
    staleTime: 60_000,
  });

  const invalidateTentsQuery = () => {
    queryClient.invalidateQueries({
      queryKey: ["retreat-tents", retreatId],
    });
  };

  const handleOpenLock = useCallback(() => {
    modal.open({
      title: t("lock.title", {
        defaultMessage: "Lock service tents",
      }),
      size: "md",
      customRender() {
        return (
          <LockTentsModal
            retreatId={retreatId}
            serviceSpaces={serviceSpacesArray}
            onCancel={modal.close}
            onSuccess={() => {
              modal.close?.();
              invalidateTentsQuery();
            }}
          />
        );
      },
    });
  }, [modal, t, retreatId, serviceSpacesArray, invalidateServiceSpacesQuery]);

  const tentsDataArray: RetreatLite[] = useMemo(() => {
    if (!tentsData) {
      return [];
    }

    const { tents } = tentsData;

    if (Array.isArray(tents)) {
      return tents;
    }

    return tents ? [tents] : [];
  }, [tentsData]);

  const canEdit = useMemo(() => {
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

  const openTentDetails = useCallback(
    (tentId: UniqueIdentifier, startInEdit = false) => {
      const tent = tentsDataArray.find(
        (item) => String(item.tentId) === String(tentId)
      );

      if (!tent) {
        return;
      }

      modal.open({
        title: t("title", { number: tent.number }),
        size: "md",
        customRender() {
          return (
            <TentDetails
              tentId={tent.tentId}
              retreatId={retreatId}
              canEdit={canEdit}
              startInEdit={startInEdit && canEdit}
              onClose={modal.close}
              onUpdated={(updatedTent) => {
                queryClient.setQueryData<RetreatRequest | undefined>(
                  ["retreat-tents", filters],
                  (previous) => {
                    if (!previous) {
                      return previous;
                    }

                    if (Array.isArray(previous.tents)) {
                      return {
                        ...previous,
                        tents: previous.tents.map((row) =>
                          row.tentId === updatedTent.tentId
                            ? { ...row, ...updatedTent }
                            : row
                        ),
                      };
                    }

                    return previous;
                  }
                );

                queryClient.invalidateQueries({
                  queryKey: ["retreat-tents"],
                });
              }}
            />
          );
        },
      });
    },
    [tentsDataArray, modal, t, retreatId, canEdit, queryClient, filters]
  );

  const handleEdit = useCallback(
    (tentId: UniqueIdentifier) => {
      openTentDetails(tentId, true);
    },
    [openTentDetails]
  );

  const handleView = useCallback(
    (tentId: UniqueIdentifier) => {
      openTentDetails(tentId, false);
    },
    [openTentDetails]
  );

  const createIndividualTent = () => {
    modal.open({
      title: t("createIndividual"),
      size: "md",
      customRender() {
        return (
          <CreateTentForm
            retreatId={retreatId}
            onSuccess={() => {
              modal.close?.();
              queryClient.invalidateQueries({ queryKey: ["retreat-tents"] });
            }}
          />
        );
      },
    });
  };

  const createTentBulk = () => {
    modal.open({
      title: t("createBulk"),
      size: "md",
      customRender() {
        return (
          <CreateTentBulkForm
            retreatId={retreatId}
            onSuccess={() => {
              modal.close?.();
              queryClient.invalidateQueries({ queryKey: ["retreat-tents"] });
            }}
          />
        );
      },
    });
  };

  const handleSaveReorder = useCallback(
    async (items: Items) => {
      try {
        // Transform items to the format expected by the API
        const reorderData = Object.entries(items).map(
          ([tentId, participantIds]) => ({
            tentId,
            participantIds: participantIds.map((id) => String(id)),
          })
        );

        await apiClient.put(`/retreats/${retreatId}/tents/reorder`, {
          data: reorderData,
        });

        setTentsReorderFlag(false);

        // Refetch tents data to get updated order
        queryClient.invalidateQueries({ queryKey: ["retreat-tents"] });

        enqueueSnackbar("Barracas reordenadas com sucesso!", {
          variant: "success",
        });
      } catch (error) {
        console.error("Error saving tents reorder:", error);
        enqueueSnackbar("Erro ao reordenar barracas", { variant: "error" });
        queryClient.invalidateQueries({ queryKey: ["retreat-tents"] });
        throw error;
      }
    },
    [retreatId, queryClient]
  );

  const handleFiltersChange = (
    newFilters: TableDefaultFilters<RetreatsCardTableFilters>
  ) => {
    updateFilters({ ...filters, ...newFilters });
  };

  const handleApplyFilters = (
    newFilters: Partial<TableDefaultFilters<RetreatsCardTableFilters>>
  ) => {
    updateFilters({ ...filters, ...newFilters });
  };

  if (isLoading) return <Typography>Loading tents...</Typography>;
  if (isError) return <Typography>No data available.</Typography>;

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
        <TentsActionBar
          hasCreatePermission={hasCreatePermission}
          isReordering={tentsReorderFlag}
          filters={filters}
          activeFiltersCount={activeFiltersCount}
          onCreateTent={createIndividualTent}
          onAddParticipant={handleAddParticipantInTent}
          onLock={handleOpenLock}
          onApplyFilters={handleApplyFilters}
          onResetFilters={resetFilters}
        />
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {isLoading && (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ height: "100%" }}
          >
            <CircularProgress />
          </Stack>
        )}
        {isError && (
          <Typography color="error">Erro ao carregar barracas.</Typography>
        )}
        {!isLoading && !isError && (
          <RetreatTentsTable
            setTentsReorderFlag={setTentsReorderFlag}
            onSaveReorder={handleSaveReorder}
            total={tentsData?.tents.length || 0}
            filters={filters}
            items={tentsDataArray}
            onEdit={handleEdit}
            onView={handleView}
            onFiltersChange={handleFiltersChange}
            retreatId={retreatId}
            canEdit={canEdit}
          />
        )}
      </Box>
    </Container>
  );
}
