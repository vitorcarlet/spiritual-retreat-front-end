"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, Skeleton, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { DataTable, DataTableColumn } from "@/src/components/table/DataTable";
import SearchField from "@/src/components/filters/SearchField";
import apiClient from "@/src/lib/axiosClientInstance";
import { useModal } from "@/src/hooks/useModal";
import ServiceRegistrationForm from "../ServiceRegistrationForm";
import ParticipantPublicFormTabCreate from "../../no-contemplated/ParticipantPublicFormTabCreate";
import { GridRowId } from "@mui/x-data-grid";
import { SendMessage } from "../confirmed/SendMessage";

interface ServiceUnassignedItem {
  registrationId?: string;
  name?: string;
  city?: string;
  email?: string;
  cpf?: string;
  preferredSpaceId?: string;
  preferredSpaceName?: string;
}

type ServiceUnassignedRow = ServiceUnassignedItem & { id: string };

type ServiceUnassignedResponse = {
  version?: number;
  items?: ServiceUnassignedItem[];
};

const buildRowId = (item: ServiceUnassignedItem, index: number): string =>
  item.registrationId || item.email || `${item.name ?? "participant"}-${index}`;

const getUnassignedServiceRegistrations = async (
  retreatId: string
): Promise<{ version?: number; rows: ServiceUnassignedRow[] }> => {
  const { data } = await apiClient.get<ServiceUnassignedResponse>(
    `/retreats/${retreatId}/service/registrations/roster/unassigned`
  );

  const items = data.items ?? [];

  const rows = items.map((item, index) => ({
    id: buildRowId(item, index),
    registrationId: item.registrationId,
    name: item.name ?? "",
    city: item.city ?? "",
    email: item.email ?? "",
    cpf: item.cpf ?? "",
    preferredSpaceId: item.preferredSpaceId,
    preferredSpaceName: item.preferredSpaceName ?? "",
  }));

  return { version: data.version, rows };
};

const NoRowsFallback = ({ message }: { message: string }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      minHeight: 200,
      p: 3,
      textAlign: "center",
    }}
  >
    <Typography variant="body1" fontWeight={500} color="text.secondary">
      {message}
    </Typography>
  </Box>
);

export default function ServiceUnassignedTab({ id }: { id: string }) {
  const t = useTranslations();
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const modal = useModal();

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["service", "unassigned", id],
    queryFn: () => getUnassignedServiceRegistrations(id),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!error) {
      return;
    }
    const message = axios.isAxiosError(error)
      ? ((error.response?.data as { message?: string; error?: string })
          ?.message ??
        (error.response?.data as { message?: string; error?: string })?.error ??
        error.message)
      : t("contemplations.service.unassigned.error");

    enqueueSnackbar(message, {
      variant: "error",
      autoHideDuration: 6000,
    });
  }, [error, t]);

  const rows = useMemo(() => data?.rows ?? [], [data]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const normalized = search.trim().toLowerCase();
    return rows.filter((row) =>
      [row.name, row.email, row.city, row.cpf, row.preferredSpaceName].some(
        (value) => (value ? value.toLowerCase().includes(normalized) : false)
      )
    );
  }, [rows, search]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch({ throwOnError: false });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateNewParticipant = (retreatId: string) => {
    modal.open({
      title: t("contemplations.no-contemplated.create-new-participant"),
      size: "md",
      customRender: () => (
        <ParticipantPublicFormTabCreate retreatId={retreatId} />
      ),
    });
  };

  function handleOpenMessagesComponent(selectedIds: GridRowId[] | "all"): void {
    const allParticipants = (rows ?? []).map((participant) => ({
      id: String(participant.id),
      name: participant.name || `Participante ${participant.id}`,
    }));

    const isAll =
      selectedIds === "all" ||
      (Array.isArray(selectedIds) && selectedIds.length !== 1);

    const initialIds =
      Array.isArray(selectedIds) && !isAll ? [String(selectedIds[0])] : [];

    if (!isAll && initialIds.length) {
      const selectedArray = Array.isArray(selectedIds)
        ? selectedIds
        : [selectedIds];

      selectedArray.forEach((idValue) => {
        if (!allParticipants.find((p) => p.id === String(idValue))) {
          allParticipants.push({
            id: String(idValue),
            name: `Participante ${idValue}`,
          });
        }
      });
    }

    modal.open({
      title: "Enviar Mensagem",
      size: "xl",
      customRender: () => (
        <SendMessage
          retreatId={id}
          mode={isAll ? "all" : "single"}
          participants={allParticipants}
          initialParticipantIds={initialIds}
          onCancel={() => modal.close?.()}
          onSuccess={() => modal.close?.()}
        />
      ),
    });
  }

  const handleOpenRegistration = useCallback(
    (row: ServiceUnassignedRow) => {
      if (!row.registrationId) {
        enqueueSnackbar(
          t("contemplations.service.unassigned.errors.missing-id"),
          {
            variant: "warning",
            autoHideDuration: 4000,
          }
        );
        return;
      }

      modal.open({
        title: t("contemplations.service.unassigned.modal-title", {
          name: row.name || "",
        }),
        size: "lg",
        customRender: () => (
          <ServiceRegistrationForm
            retreatId={id}
            registrationId={row.registrationId as string}
            onSuccess={() => {
              modal.close?.();
              refetch();
            }}
          />
        ),
      });
    },
    [id, modal, refetch, t]
  );

  const columns = useMemo<DataTableColumn<ServiceUnassignedRow>[]>(
    () => [
      {
        field: "name",
        headerName: t("contemplations.service.unassigned.columns.name"),
        flex: 1,
        minWidth: 200,
      },
      {
        field: "email",
        headerName: t("contemplations.service.unassigned.columns.email"),
        flex: 1,
        minWidth: 220,
      },
      {
        field: "city",
        headerName: t("contemplations.service.unassigned.columns.city"),
        flex: 1,
        minWidth: 160,
      },
      {
        field: "cpf",
        headerName: t("contemplations.service.unassigned.columns.cpf"),
        minWidth: 140,
      },
      {
        field: "preferredSpaceName",
        headerName: t(
          "contemplations.service.unassigned.columns.preferredSpaceName"
        ),
        flex: 1,
        minWidth: 200,
      },
    ],
    [t]
  );

  const subtitle = t("contemplations.service.unassigned.subtitle", {
    count: rows.length,
  });

  const isBusy = isLoading || isFetching || isRefreshing;

  return (
    <Box
      sx={{
        p: 2,
        height: "100%",
        minWidth: "100%",
        display: "flex",
        flexDirection: "column",
        maxWidth: "100%",
        overflowY: "hidden",
        boxSizing: "border-box",
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
          minHeight: 40,
        }}
      >
        <Button
          variant="contained"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing
            ? t("contemplations.service.unassigned.refreshing")
            : t("contemplations.service.unassigned.refresh")}
        </Button>

        <SearchField
          value={search}
          onChange={setSearch}
          placeholder={t(
            "contemplations.service.unassigned.search-placeholder"
          )}
        />

        <Chip
          color="primary"
          variant="outlined"
          label={t("contemplations.service.unassigned.total-count", {
            count: filteredRows.length,
          })}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleCreateNewParticipant(id)}
        >
          {t("contemplations.no-contemplated.create-new-participant")}
        </Button>

        <Button
          variant="outlined"
          color="primary"
          onClick={() => handleOpenMessagesComponent("all")}
        >
          Enviar mensagens para todos
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, maxHeight: "90%" }}>
        {isLoading ? (
          <Skeleton variant="rounded" height={320} />
        ) : (
          <DataTable<ServiceUnassignedRow, TableDefaultFilters>
            rows={filteredRows}
            columns={columns}
            loading={isBusy}
            showToolbar={false}
            page={0}
            pageSize={10}
            pageSizeOptions={[10, 25, 50, 100]}
            rowCount={filteredRows.length}
            paginationMode="client"
            sortingMode="client"
            filterMode="client"
            title={t("contemplations.service.unassigned.title")}
            subtitle={subtitle}
            noRowsOverlay={
              <NoRowsFallback
                message={t("contemplations.service.unassigned.no-data")}
              />
            }
            rowHeight={68}
            autoHeight
            autoWidth
            actions={[
              {
                icon: "lucide:eye",
                label: t("contemplations.service.unassigned.actions.view"),
                onClick: (row) => handleOpenRegistration(row),
                color: "primary",
                disabled: (row) => !row.registrationId,
              },
              {
                icon: "lucide:send",
                label: "Enviar Mensagem",
                onClick: (participant) =>
                  handleOpenMessagesComponent([participant.id]),
                color: "primary",
              },
            ]}
            onRowDoubleClick={(params) =>
              handleOpenRegistration(params.row as ServiceUnassignedRow)
            }
          />
        )}
      </Box>
    </Box>
  );
}
