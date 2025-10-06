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
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import RetreatTentsTable from "./RetreatTentsTable";
import {
  RetreatsCardTableDateFilters,
  RetreatsCardTableFilters,
} from "../../types";
import getPermission from "@/src/utils/getPermission";
import { useSession } from "next-auth/react";
import { useUrlFilters } from "@/src/hooks/useUrlFilters";
import { getFilters } from "./getFilters";
import FilterButton from "../../../filters/FilterButton";
import { useTranslations } from "next-intl";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useModal } from "@/src/hooks/useModal";
import CreateTentForm from "./CreateTentForm";
import CreateTentBulkForm from "./CreateTentBulkForm";
import { Items } from "./types";
import TentDetails from "./TentDetails";
import type { RequestResponse } from "@/src/lib/requestServer";

interface RetreatTentRequest {
  rows: RetreatTent[];
  total: number;
  page: number;
  pageLimit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const getRetreatTents = async (
  filters: TableDefaultFilters<
    RetreatsCardTableFilters & RetreatsCardTableDateFilters
  >,
  retreatId: string
) => {
  const response = await handleApiResponse<RequestResponse<RetreatTentRequest>>(
    await sendRequestServerVanilla.get(`/retreats/${retreatId}/tents`, {
      params: filters,
    })
  );

  if (!response || response.error) {
    throw new Error("Failed to fetch retreats");
  }
  return response.data as unknown as RetreatTentRequest;
};

interface RetreatTentsProps {
  id: string;
}

export default function RetreatTents({ id: retreatId }: RetreatTentsProps) {
  const tTent = useTranslations("tents");
  const tTentDetails = useTranslations("tent-details");
  const { filters, updateFilters, activeFiltersCount, resetFilters } =
    useUrlFilters<TableDefaultFilters<RetreatsCardTableFilters>>({
      defaultFilters: {
        page: 1,
        pageLimit: 12,
      },
      excludeFromCount: ["page", "pageLimit"], // Don't count pagination in active filters
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
    queryFn: () => getRetreatTents(filters, retreatId),
    staleTime: 60_000,
  });

  const tentsDataArray: RetreatTent[] = useMemo(() => {
    if (!tentsData) {
      return [];
    }

    const { rows } = tentsData;

    if (Array.isArray(rows)) {
      return rows;
    }

    return rows ? [rows] : [];
  }, [tentsData]);

  const canEditTent = useMemo(() => {
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

  // const handlePersist = useCallback(
  //   async (updated: RetreatFamily[]) => {
  //     // Persistir ordenação / mudanças de membros
  //     // Ajustar endpoint conforme backend
  //     try {
  //       await sendRequestServerVanilla.put(
  //         `/retreats/${retreatId}/families/reorder`,
  //         {
  //           families: updated.map((f) => ({
  //             id: f.id,
  //             memberIds: f.members.map((m) => m.id),
  //             order: updated.findIndex((ff) => ff.id === f.id),
  //           })),
  //         }
  //       );
  //     } catch (e) {
  //       console.error("Persist families reorder failed", e);
  //     }
  //   },
  //   [retreatId]
  // );

  const openTentDetails = useCallback(
    (tentId: UniqueIdentifier, startInEdit = false) => {
      const tent = tentsDataArray.find(
        (item) => String(item.id) === String(tentId)
      );

      if (!tent) {
        return;
      }

      modal.open({
        title: tTentDetails("title", { number: tent.number }),
        size: "md",
        customRender() {
          return (
            <TentDetails
              tent={tent}
              retreatId={retreatId}
              canEdit={canEditTent}
              startInEdit={startInEdit && canEditTent}
              onClose={modal.close}
              onUpdated={(updatedTent) => {
                queryClient.setQueryData<RetreatTentRequest | undefined>(
                  ["retreat-tents", filters],
                  (previous) => {
                    if (!previous) {
                      return previous;
                    }

                    if (Array.isArray(previous.rows)) {
                      return {
                        ...previous,
                        rows: previous.rows.map((row) =>
                          row.id === updatedTent.id
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
    [
      tentsDataArray,
      modal,
      tTentDetails,
      retreatId,
      canEditTent,
      queryClient,
      filters,
    ]
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
      title: tTent("createIndividual"),
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
      title: tTent("createBulk"),
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

        await sendRequestServerVanilla.put(
          `/retreats/${retreatId}/tents/reorder`,
          {
            data: reorderData,
          }
        );
        setTentsReorderFlag?.(false);
        // Refetch families data to get updated order
        queryClient.invalidateQueries({ queryKey: ["retreat-tents"] });
      } catch (error) {
        console.error("Error saving tents reorder:", error);
        queryClient.invalidateQueries({ queryKey: ["retreat-tents"] });
        throw error; // Re-throw to handle in the component
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

  if (isLoading) return <Typography>Loading retreats...</Typography>;
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
              onClick={createIndividualTent}
              disabled={tentsReorderFlag}
            >
              {tTent("createIndividual")}
            </Button>
            <Button
              variant="contained"
              onClick={createTentBulk}
              disabled={tentsReorderFlag}
            >
              {tTent("createBulk")}
            </Button>
          </>
        )}
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
            total={tentsData?.total || 0}
            filters={filters}
            items={tentsDataArray}
            onEdit={handleEdit}
            onView={handleView}
            onFiltersChange={handleFiltersChange}
            retreatId={retreatId}
            canEditTent={canEditTent}
          />
        )}
      </Box>
    </Container>
  );
}
