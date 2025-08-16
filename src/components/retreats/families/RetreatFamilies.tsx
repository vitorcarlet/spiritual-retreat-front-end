"use client";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import {
  Box,
  Stack,
  Chip,
  Typography,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import RetreatFamiliesTable from "./RetreatFamiliesTable";
import {
  RetreatsCardTableDateFilters,
  RetreatsCardTableFilters,
} from "../types";
import getPermission from "@/src/utils/getPermission";
import { useSession } from "next-auth/react";
import { useUrlFilters } from "@/src/hooks/useUrlFilters";

const getRetreatFamilies = async (
  filters: TableDefaultFilters<
    RetreatsCardTableFilters & RetreatsCardTableDateFilters
  >
) => {
  const response = await handleApiResponse<RequestResponse<RetreatFamily[]>>(
    await sendRequestServerVanilla.get("/retreats", { params: filters })
  );

  if (!response || response.error) {
    throw new Error("Failed to fetch retreats");
  }
  console.log("Fetched reports:", response);
  return response.data as RequestResponse<RetreatFamily[]>;
};

interface RetreatFamiliesProps {
  retreatId: string;
}

export default function RetreatFamilies({ retreatId }: RetreatFamiliesProps) {
  const { filters, updateFilters, activeFiltersCount, resetFilters } =
    useUrlFilters<TableDefaultFilters<RetreatsCardTableFilters>>({
      defaultFilters: {
        page: 1,
        pageLimit: 4,
      },
      excludeFromCount: ["page", "pageLimit"], // Don't count pagination in active filters
    });

  const session = useSession();
  const [hasCreatePermission, setHasCreatePermission] = useState(false);

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

  const { data, isLoading, isError } = useQuery({
    queryKey: ["retreat-families", retreatId, cityFilter],
    queryFn: () =>
      getRetreatFamilies({
        retreatId,
        city: cityFilter || undefined,
      }),
    staleTime: 60_000,
  });

  const families = useMemo(() => data || [], [data]);

  const handlePersist = useCallback(
    async (updated: Family[]) => {
      // Persistir ordenação / mudanças de membros
      // Ajustar endpoint conforme backend
      try {
        await sendRequestServerVanilla.put(
          `/retreats/${retreatId}/families/reorder`,
          {
            families: updated.map((f) => ({
              id: f.id,
              memberIds: f.members.map((m) => m.id),
              order: updated.findIndex((ff) => ff.id === f.id),
            })),
          }
        );
      } catch (e) {
        console.error("Persist families reorder failed", e);
      }
    },
    [retreatId]
  );

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", height: "100%", gap: 2 }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="h6" fontWeight={600}>
          Famílias
        </Typography>
        <TextField
          size="small"
          label="Cidade"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
        />
        {cityFilter && (
          <Chip
            label={`Cidade: ${cityFilter}`}
            color="warning"
            onDelete={() => setCityFilter("")}
            variant="outlined"
          />
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
            initialFamilies={families}
            onPersist={handlePersist}
          />
        )}
      </Box>
    </Box>
  );
}
