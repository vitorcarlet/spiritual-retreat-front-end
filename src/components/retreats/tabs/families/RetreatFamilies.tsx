/* eslint-disable @typescript-eslint/no-unused-vars */
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
import RetreatFamiliesTable from "./RetreatFamiliesTable";
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
import Link from "next/link";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useModal } from "@/src/hooks/useModal";
import CreateFamilyForm from "./CreateFamilyForm";
import SendMessageToFamilyForm from "./SendMessageToFamilyForm";
import AddParticipantToFamilyForm from "./AddParticipantToFamilyForm";
import ConfigureFamily from "./ConfigureFamily";
import DrawFamilies from "./DrawFamilies";
import { Items } from "./types";
import FamilyDetails from "./FamilyDetails";
import apiClient from "@/src/lib/axiosClientInstance";

interface RetreatFamilyRequest {
  rows: RetreatFamily[];
  total: number;
  page: number;
  pageLimit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const getRetreatFamilies = async (
  filters: TableDefaultFilters<
    RetreatsCardTableFilters & RetreatsCardTableDateFilters
  >,
  retreatId: string
) => {
  const response = await apiClient.get(`/retreats/${retreatId}/families`, {
    params: filters,
  });

  return response.data as unknown as RetreatFamilyRequest;
};

interface RetreatFamiliesProps {
  id: string;
}

export default function RetreatFamilies({
  id: retreatId,
}: RetreatFamiliesProps) {
  const t = useTranslations();
  const tFamilyDetails = useTranslations("family-details");
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
  const [familiesReorderFlag, setFamiliesReorderFlag] =
    useState<boolean>(false);
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
    data: familiesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["retreat-families", filters],
    queryFn: () => getRetreatFamilies(filters, retreatId),
    staleTime: 60_000,
  });

  const familiesDataArray: RetreatFamily[] = useMemo(() => {
    if (!familiesData) {
      return [];
    }

    const { rows } = familiesData;

    if (Array.isArray(rows)) {
      return rows;
    }

    return rows ? [rows] : [];
  }, [familiesData]);

  const canEditFamily = useMemo(() => {
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

  const openFamilyDetails = useCallback(
    (familyId: UniqueIdentifier, startInEdit = false) => {
      const family = familiesDataArray.find(
        (item) => String(item.id) === String(familyId)
      );

      if (!family) {
        return;
      }

      modal.open({
        title: tFamilyDetails("title", { family: family.name }),
        size: "md",
        customRender() {
          return (
            <FamilyDetails
              family={family}
              retreatId={retreatId}
              canEdit={canEditFamily}
              startInEdit={startInEdit && canEditFamily}
              onClose={modal.close}
              onUpdated={(updatedFamily) => {
                queryClient.setQueryData<RetreatFamilyRequest | undefined>(
                  ["retreat-families", filters],
                  (previous) => {
                    if (!previous) {
                      return previous;
                    }

                    if (!Array.isArray(previous.rows)) {
                      return previous;
                    }

                    return {
                      ...previous,
                      rows: previous.rows.map((row) =>
                        row.id === updatedFamily.id
                          ? { ...row, ...updatedFamily }
                          : row
                      ),
                    };
                  }
                );

                queryClient.invalidateQueries({
                  queryKey: ["retreat-families"],
                });
              }}
            />
          );
        },
      });
    },
    [
      familiesDataArray,
      modal,
      tFamilyDetails,
      retreatId,
      canEditFamily,
      queryClient,
      filters,
    ]
  );

  const handleEdit = useCallback(
    (familyId: UniqueIdentifier) => {
      openFamilyDetails(familyId, true);
    },
    [openFamilyDetails]
  );

  const handleView = useCallback(
    (familyId: UniqueIdentifier) => {
      openFamilyDetails(familyId, false);
    },
    [openFamilyDetails]
  );

  const createNewFamily = () => {
    modal.open({
      title: t("create-new-family"),
      size: "md",
      customRender() {
        return (
          <CreateFamilyForm
            retreatId={retreatId}
            onSuccess={() => {
              modal.close?.();
              // Refetch families data
              queryClient.invalidateQueries({ queryKey: ["retreat-families"] });
            }}
          />
        );
      },
    });
  };

  const sendMessageToFamily = () => {
    modal.open({
      title: t("send-message-to-family"),
      size: "md",
      customRender() {
        return (
          <SendMessageToFamilyForm
            retreatId={retreatId}
            families={familiesDataArray}
            onSuccess={() => {
              modal.close?.();
            }}
          />
        );
      },
    });
  };

  const addParticipantInFamily = () => {
    modal.open({
      title: t("add-participant-in-family"),
      size: "md",
      customRender() {
        return (
          <AddParticipantToFamilyForm
            retreatId={retreatId}
            families={familiesDataArray}
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

  const handleSaveReorder = useCallback(
    async (items: Items) => {
      try {
        // Transform items to the format expected by the API
        const reorderData = Object.entries(items).map(
          ([familyId, memberIds]) => ({
            familyId,
            memberIds: memberIds.map((id) => String(id)),
          })
        );

        await apiClient.put(`/retreats/${retreatId}/families/reorder`, {
          data: reorderData,
        });
        setFamiliesReorderFlag(false);
        // Refetch families data to get updated order
        queryClient.invalidateQueries({ queryKey: ["retreat-families"] });
      } catch (error) {
        console.error("Error saving families reorder:", error);
        queryClient.invalidateQueries({ queryKey: ["retreat-families"] });
        throw error; // Re-throw to handle in the component
      }
    },
    [retreatId, queryClient]
  );

  const configureFamilies = () => {
    modal.open({
      title: t("family-configuration"),
      size: "md",
      customRender() {
        return (
          <ConfigureFamily
            retreatId={retreatId}
            onSuccess={() => {
              modal.close?.();
              // Refetch families data
              queryClient.invalidateQueries({ queryKey: ["retreat-families"] });
            }}
          />
        );
      },
    });
  };

  const drawFamilies = () => {
    modal.open({
      title: t("family-draw"),
      size: "md",
      customRender() {
        return (
          <DrawFamilies
            retreatId={retreatId}
            onSuccess={() => {
              modal.close?.();
              // Refetch families data
              queryClient.invalidateQueries({ queryKey: ["retreat-families"] });
            }}
          />
        );
      },
    });
  };

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
              onClick={createNewFamily}
              disabled={familiesReorderFlag}
            >
              {t("create-new-family")}
            </Button>
            <Button
              variant="contained"
              onClick={sendMessageToFamily}
              disabled={familiesReorderFlag}
            >
              {t("send-message-to-family")}
            </Button>
            <Button
              variant="contained"
              onClick={addParticipantInFamily}
              disabled={familiesReorderFlag}
            >
              {t("add-participant-in-family")}
            </Button>
            <Button
              variant="contained"
              onClick={configureFamilies}
              disabled={familiesReorderFlag}
            >
              {t("family-config")}
            </Button>
            <Button
              variant="contained"
              onClick={drawFamilies}
              disabled={familiesReorderFlag}
            >
              {t("draw-the-families")}
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
          <Typography color="error">Erro ao carregar famílias.</Typography>
        )}
        {!isLoading && !isError && (
          <RetreatFamiliesTable
            setFamiliesReorderFlag={setFamiliesReorderFlag}
            onSaveReorder={handleSaveReorder}
            total={familiesData?.total || 0}
            filters={filters}
            items={familiesDataArray}
            onEdit={handleEdit}
            onView={handleView}
            onFiltersChange={handleFiltersChange}
            retreatId={retreatId}
            canEditFamily={canEditFamily}
          />
        )}
      </Box>
    </Container>
  );
}
