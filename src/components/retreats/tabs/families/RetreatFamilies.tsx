"use client";

import { useState, useCallback, useMemo } from "react";
import { Container, Box } from "@mui/material";
import { useUrlFilters } from "@/src/hooks/useUrlFilters";
import { useTranslations } from "next-intl";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useModal } from "@/src/hooks/useModal";

import { useFamiliesQuery } from "./hooks/useFamiliesQuery";
import { useFamiliesPermissions } from "./hooks/useFamiliesPermissions";

import FamiliesActionBar from "./components/FamiliesActionBar";
import FamiliesContent from "./components/FamiliesContent";

import CreateFamilyForm from "./CreateFamilyForm";
import FamilyCommunicationTabs from "./FamilyCommunicationTabs";
import AddParticipantToFamilyForm from "./AddParticipantToFamilyForm";
import ConfigureFamily from "./ConfigureFamily";
import DrawFamilies from "./DrawFamilies";
import DeleteFamilyForm from "./DeleteFamilyForm";
import FamilyDetails from "./FamilyDetails";
import LockFamiliesModal from "./LockFamiliesModal";
import ResetFamiliesModal from "./ResetFamiliesModal";

import { Items } from "./types";

import apiClient from "@/src/lib/axiosClientInstance";
import { RetreatsCardTableFilters } from "@/src/components/public/retreats/types";

interface RetreatFamiliesProps {
  id: string;
}

export default function RetreatFamilies({
  id: retreatId,
}: RetreatFamiliesProps) {
  const t = useTranslations();
  const tFamilyDetails = useTranslations("family-details");
  const modal = useModal();

  const { filters, updateFilters } = useUrlFilters<
    TableDefaultFilters<RetreatsCardTableFilters>
  >({
    defaultFilters: {
      page: 1,
      pageLimit: 12,
    },
    excludeFromCount: ["page", "pageLimit"],
  });

  const { hasCreatePermission, canEditFamily } = useFamiliesPermissions();
  const {
    familiesData,
    familiesDataArray,
    isLoading,
    isFetching,
    isError,
    familiesVersion,
    familiesLocked,
    invalidateFamiliesQuery,
    queryClient,
  } = useFamiliesQuery(retreatId, filters);

  const [isReordering, setIsReordering] = useState(false);

  // ===== Modal Handlers =====
  const handleOpenCreateFamily = useCallback(() => {
    modal.open({
      title: t("create-new-family"),
      size: "md",
      customRender() {
        return (
          <CreateFamilyForm
            retreatId={retreatId}
            onSuccess={() => {
              modal.close?.();
              invalidateFamiliesQuery();
            }}
          />
        );
      },
    });
  }, [modal, t, retreatId, invalidateFamiliesQuery]);

  const handleOpenSendMessage = useCallback(() => {
    modal.open({
      title: t("send-message-to-family"),
      size: "md",
      customRender() {
        return (
          <FamilyCommunicationTabs
            retreatId={retreatId}
            families={familiesDataArray}
            onSuccess={() => {
              modal.close?.();
            }}
          />
        );
      },
    });
  }, [modal, t, retreatId, familiesDataArray]);

  const handleOpenAddParticipant = useCallback(() => {
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
            }}
          />
        );
      },
    });
  }, [modal, t, retreatId, familiesDataArray]);

  const handleOpenConfigure = useCallback(() => {
    modal.open({
      title: t("family-configuration"),
      size: "md",
      customRender() {
        return (
          <ConfigureFamily
            retreatId={retreatId}
            onSuccess={() => {
              modal.close?.();
              invalidateFamiliesQuery();
            }}
          />
        );
      },
    });
  }, [modal, t, retreatId, invalidateFamiliesQuery]);

  const handleOpenDraw = useCallback(() => {
    modal.open({
      title: t("family-draw"),
      size: "md",
      customRender() {
        return (
          <DrawFamilies
            retreatId={retreatId}
            onSuccess={() => {
              modal.close?.();
              invalidateFamiliesQuery();
            }}
          />
        );
      },
    });
  }, [modal, t, retreatId, invalidateFamiliesQuery]);

  const handleOpenLock = useCallback(() => {
    modal.open({
      title: t("lock-families"),
      size: "lg",
      customRender() {
        return (
          <LockFamiliesModal
            retreatId={retreatId}
            families={familiesDataArray}
            onSuccess={() => {
              modal.close?.();
              invalidateFamiliesQuery();
            }}
            onCancel={() => modal.close?.()}
          />
        );
      },
    });
  }, [modal, t, retreatId, familiesDataArray, invalidateFamiliesQuery]);

  const handleOpenReset = useCallback(() => {
    modal.open({
      title: t("reset-families"),
      size: "md",
      customRender() {
        return (
          <ResetFamiliesModal
            retreatId={retreatId}
            families={familiesDataArray}
            familiesLocked={familiesLocked}
            onSuccess={() => {
              modal.close?.();
              invalidateFamiliesQuery();
            }}
            onCancel={() => modal.close?.()}
          />
        );
      },
    });
  }, [
    modal,
    t,
    retreatId,
    familiesDataArray,
    familiesLocked,
    invalidateFamiliesQuery,
  ]);

  const handleOpenFamilyDetails = useCallback(
    (familyId: UniqueIdentifier, startInEdit = false) => {
      modal.open({
        title: tFamilyDetails("title"),
        size: "md",
        customRender() {
          return (
            <FamilyDetails
              familyId={familyId}
              retreatId={retreatId}
              canEdit={canEditFamily}
              startInEdit={startInEdit && canEditFamily}
              onClose={modal.close}
              onUpdated={(updatedFamily) => {
                queryClient.setQueryData<any>(
                  ["retreat-families", retreatId, filters],
                  (previous: { families: any[] }) => {
                    if (!previous) return previous;
                    if (!Array.isArray(previous.families)) return previous;

                    return {
                      ...previous,
                      families: previous.families.map((row) =>
                        row.familyId === updatedFamily.familyId
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
    [modal, tFamilyDetails, retreatId, canEditFamily, queryClient, filters]
  );

  const handleDelete = useCallback(
    (familyId: UniqueIdentifier) => {
      const family = familiesDataArray.find(
        (item) => String(item.familyId) === String(familyId)
      );

      modal.open({
        title: t("delete-family"),
        size: "sm",
        customRender() {
          return (
            <DeleteFamilyForm
              retreatId={retreatId}
              familyId={String(familyId)}
              familyName={family?.name}
              onSuccess={() => {
                modal.close?.();
                invalidateFamiliesQuery();
              }}
              onCancel={() => modal.close?.()}
            />
          );
        },
      });
    },
    [modal, t, retreatId, familiesDataArray, invalidateFamiliesQuery]
  );

  const handleEdit = useCallback(
    (familyId: UniqueIdentifier) => {
      handleOpenFamilyDetails(familyId, true);
    },
    [handleOpenFamilyDetails]
  );

  const handleView = useCallback(
    (familyId: UniqueIdentifier) => {
      handleOpenFamilyDetails(familyId, false);
    },
    [handleOpenFamilyDetails]
  );

  const handleSaveReorder = useCallback(
    async (items: Items) => {
      try {
        const families = Object.entries(items)
          .map(([familyId, memberIds]) => {
            const originalFamily = familiesDataArray.find(
              (f) => String(f.familyId) === String(familyId)
            );

            if (!originalFamily) return null;

            const members = memberIds.map((memberId, index) => ({
              registrationId: String(memberId),
              position: index,
            }));

            return {
              familyId: String(familyId),
              name: originalFamily.name,
              capacity: members.length,
              members,
            };
          })
          .filter(Boolean);

        const payload = {
          retreatId,
          version: familiesVersion ?? 0,
          families,
          ignoreWarnings: true,
        };

        await apiClient.put(`/retreats/${retreatId}/families`, payload);

        setIsReordering(false);
        invalidateFamiliesQuery();
      } catch (error) {
        console.error("Error saving families reorder:", error);
        invalidateFamiliesQuery();
        throw error;
      }
    },
    [retreatId, familiesVersion, familiesDataArray, invalidateFamiliesQuery]
  );

  const handleFiltersChange = useCallback(
    (newFilters: TableDefaultFilters<RetreatsCardTableFilters>) => {
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
      <FamiliesActionBar
        hasCreatePermission={hasCreatePermission}
        isReordering={isReordering}
        onCreateFamily={handleOpenCreateFamily}
        onSendMessage={handleOpenSendMessage}
        onAddParticipant={handleOpenAddParticipant}
        onConfigure={handleOpenConfigure}
        onDraw={handleOpenDraw}
        onLock={handleOpenLock}
        onReset={handleOpenReset}
      />

      <FamiliesContent
        isLoading={isLoading}
        isError={isError}
        isFetching={isFetching}
        familiesDataArray={familiesDataArray}
        total={familiesDataArray.length}
        filters={filters}
        isReordering={isReordering}
        canEditFamily={canEditFamily}
        retreatId={retreatId}
        onSaveReorder={handleSaveReorder}
        onSetReordering={setIsReordering}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onFiltersChange={handleFiltersChange}
      />
    </Container>
  );
}
