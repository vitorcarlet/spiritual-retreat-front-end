"use client";

import { useCallback, useState } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";

import { Container } from "@mui/material";

import { useModal } from "@/src/hooks/useModal";
import { useUrlFilters } from "@/src/hooks/useUrlFilters";
import apiClient from "@/src/lib/axiosClientInstance";

import ServiceTeamDetails from "./ServiceTeamDetails";
import CreateServiceTeamForm from "./CreateServiceTeamForm";
import LockServiceSpacesModal from "./LockServiceSpacesModal";
import ConfigureServiceSpace from "./ConfigureServiceSpace";

import type { Items } from "./types";
import type { RetreatsCardTableFilters } from "@/src/components/retreats/types";
import { useServiceSpacesPermissions } from "./hooks/usePermissions";
import { useServiceSpacesQuery } from "./hooks/useQuery";
import ServiceTeamActionBar from "./ServiceSpacesActionBar";
import ServiceSpaceContent from "./ServiceSpacesContent";
import AddMemberToServiceTeamForm from "./AddMemberToServiceTeamForm";
import { useTranslations } from "next-intl";

interface RetreatServiceTeamProps {
  id: string;
}

export default function RetreatServiceTeam({
  id: retreatId,
}: RetreatServiceTeamProps) {
  const t = useTranslations("service-team-details");
  const modal = useModal();

  const { filters, updateFilters, activeFiltersCount, resetFilters } =
    useUrlFilters<TableDefaultFilters<RetreatsCardTableFilters>>({
      defaultFilters: {
        page: 1,
        pageLimit: 12,
      },
      excludeFromCount: ["page", "pageLimit"],
    });

  const { hasCreatePermission, canEditServiceSpace } =
    useServiceSpacesPermissions();
  const {
    serviceSpaceVersion,
    // serviceSpacesData,
    serviceSpacesArray,
    isLoading,
    isFetching,
    isError,
    invalidateServiceSpacesQuery,
    queryClient,
  } = useServiceSpacesQuery(retreatId, filters);

  const [isReordering, setIsReordering] = useState(false);
  // const filtersConfig = useMemo(() => getFilters(), []);

  // ===== Modal Handlers =====
  const handleOpenCreateTeam = useCallback(() => {
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
              invalidateServiceSpacesQuery();
            }}
          />
        );
      },
    });
  }, [modal, t, retreatId, invalidateServiceSpacesQuery]);

  const handleOpenConfigure = useCallback(() => {
    modal.open({
      title: t("service-space-configurations"),
      size: "md",
      customRender() {
        return (
          <ConfigureServiceSpace
            retreatId={retreatId}
            onSuccess={() => {
              modal.close?.();
              invalidateServiceSpacesQuery();
            }}
          />
        );
      },
    });
  }, [modal, t, retreatId, invalidateServiceSpacesQuery]);

  const handleOpenLock = useCallback(() => {
    modal.open({
      title: t("lock.title", {
        defaultMessage: "Lock service teams",
      }),
      size: "md",
      customRender() {
        return (
          <LockServiceSpacesModal
            retreatId={retreatId}
            serviceSpaces={serviceSpacesArray}
            onCancel={modal.close}
            onSuccess={() => {
              modal.close?.();
              invalidateServiceSpacesQuery();
            }}
          />
        );
      },
    });
  }, [modal, t, retreatId, serviceSpacesArray, invalidateServiceSpacesQuery]);

  const handleOpenServiceSpaceDetails = useCallback(
    (spaceId: UniqueIdentifier, startInEdit = false) => {
      const space = serviceSpacesArray.find(
        (item) => item.spaceId === String(spaceId)
      );

      if (!space) return;

      modal.open({
        title: t("title", {
          defaultMessage: "Service space {space}",
          space: space.name,
        }),
        size: "md",
        customRender() {
          return (
            <ServiceTeamDetails
              spaceId={space.spaceId}
              retreatId={retreatId}
              canEdit={canEditServiceSpace}
              startInEdit={startInEdit && canEditServiceSpace}
              onClose={modal.close}
              onUpdated={(updatedSpace) => {
                queryClient.setQueryData<any>(
                  ["retreat-service-spaces", retreatId, filters],
                  (previous: any) => {
                    if (!previous || !Array.isArray(previous.rows))
                      return previous;

                    return {
                      ...previous,
                      rows: previous.rows.map((row: any) =>
                        row.spaceId === updatedSpace.space.spaceId
                          ? updatedSpace
                          : row
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
      t,
      retreatId,
      canEditServiceSpace,
      queryClient,
      filters,
      serviceSpacesArray,
    ]
  );

  const handleOpenAddMember = useCallback(() => {
    modal.open({
      title: t("sections.add-members", {
        defaultMessage: "Adicionar membros à equipe de serviço",
      }),
      size: "md",
      customRender() {
        return (
          <AddMemberToServiceTeamForm
            retreatId={retreatId}
            serviceSpaces={serviceSpacesArray}
            onSuccess={() => {
              modal.close?.();
              invalidateServiceSpacesQuery();
            }}
          />
        );
      },
    });
  }, [modal, t, retreatId, serviceSpacesArray, invalidateServiceSpacesQuery]);

  const handleEdit = useCallback(
    (spaceId: UniqueIdentifier) => {
      handleOpenServiceSpaceDetails(spaceId, true);
    },
    [handleOpenServiceSpaceDetails]
  );

  const handleView = useCallback(
    (spaceId: UniqueIdentifier) => {
      handleOpenServiceSpaceDetails(spaceId, false);
    },
    [handleOpenServiceSpaceDetails]
  );

  const handleDelete = useCallback(
    async (spaceId: UniqueIdentifier) => {
      const spaceKey = String(spaceId);
      const confirmed = window.confirm(
        t("confirmDelete", {
          defaultMessage: "Are you sure you want to delete this service space?",
        })
      );

      if (!confirmed) return;

      try {
        await apiClient.delete(
          `/retreats/${retreatId}/service/spaces/${spaceKey}`
        );

        queryClient.setQueryData<any>(
          ["retreat-service-spaces", retreatId, filters],
          (previous: any) => {
            if (!previous || !Array.isArray(previous.rows)) return previous;

            return {
              ...previous,
              rows: previous.rows.filter(
                (row: any) => row.spaceId !== spaceKey
              ),
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

  const handleSaveReorder = useCallback(
    async (items: Items) => {
      const serviceSpacesById = new Map(
        serviceSpacesArray.map((space) => [String(space.spaceId), space])
      );

      const membersIndex = new Map<string, any>();
      serviceSpacesArray.forEach((space) => {
        space.members?.forEach((member) => {
          membersIndex.set(String(member.registrationId), member);
        });
      });

      try {
        const spacesPayload = Object.entries(items).map(
          ([serviceSpaceId, memberIds]) => {
            const originalSpace = serviceSpacesById.get(serviceSpaceId);

            const members = memberIds.map((memberId, index) => ({
              registrationId: String(memberId),
              role: membersIndex.get(String(memberId))?.role ?? "member",
              position: index,
            }));

            return {
              spaceId: serviceSpaceId,
              name: originalSpace?.name ?? serviceSpaceId,
              members,
            };
          }
        );

        // Uncomment when API is ready
        await apiClient.put(`/retreats/${retreatId}/service/roster`, {
          retreatId,
          version: serviceSpaceVersion,
          spaces: spacesPayload,
          ignoreWarnings: true,
        });

        setIsReordering(false);
        invalidateServiceSpacesQuery();
      } catch (error) {
        console.error("Failed to save service space reorder", error);
        invalidateServiceSpacesQuery();
        throw error;
      }
    },
    [serviceSpacesArray, retreatId, invalidateServiceSpacesQuery]
  );

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
      <ServiceTeamActionBar
        hasCreatePermission={hasCreatePermission}
        isReordering={isReordering}
        filters={filters}
        activeFiltersCount={activeFiltersCount}
        //filtersConfig={filtersConfig}
        onCreateTeam={handleOpenCreateTeam}
        onAddParticipant={handleOpenAddMember}
        onConfigure={handleOpenConfigure}
        onLock={handleOpenLock}
        onApplyFilters={handleApplyFilters}
        onResetFilters={resetFilters}
      />

      <ServiceSpaceContent
        isLoading={isLoading}
        isError={isError}
        isFetching={isFetching}
        serviceSpacesArray={serviceSpacesArray}
        total={serviceSpacesArray.length}
        filters={filters}
        isReordering={isReordering}
        canEditServiceSpace={canEditServiceSpace}
        retreatId={retreatId}
        onSaveReorder={handleSaveReorder}
        onSetReordering={setIsReordering}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={canEditServiceSpace ? handleDelete : undefined}
        onFiltersChange={handleFiltersChange}
      />
    </Container>
  );
}
