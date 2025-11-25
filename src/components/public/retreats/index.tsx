"use client";
import { Container, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Box, Stack } from "@mui/material";
import FilterButton from "@/src/components/filters/FilterButton";

import { useTranslations } from "next-intl";
import { useUrlFilters } from "@/src/hooks/useUrlFilters";
import { useRouter } from "next/navigation";
import {
  RetreatsCardTableDateFilters,
  RetreatsCardTableFilters,
} from "./types";
import { useFilters } from "./useFilters";
import PublicRetreatsCardTable from "./table";
import apiClient from "@/src/lib/axiosClientInstance";
import axios from "axios";
import { RetreatSimple, RetreatSimpleRequest } from "../../retreats/types";

const getRetreats = async (
  filters: TableDefaultFilters<
    RetreatsCardTableFilters & RetreatsCardTableDateFilters
  >
) => {
  try {
    const response = await apiClient.get<RetreatSimpleRequest>("/Retreats", {
      params: filters,
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao reenviar notificação:", error);
    const message = axios.isAxiosError(error)
      ? ((error.response?.data as { error?: string })?.error ?? error.message)
      : "Erro ao reenviar notificação.";
    console.error(message);
  }
};

export default function PublicRetreatsPage() {
  const t = useTranslations();
  const router = useRouter();

  const { filters, updateFilters, activeFiltersCount, resetFilters } =
    useUrlFilters<TableDefaultFilters<RetreatsCardTableFilters>>({
      defaultFilters: {
        page: 1,
        pageLimit: 4,
      },
      excludeFromCount: ["page", "pageLimit"], // Don't count pagination in active filters
    });

  const { filters: filtersConfig } = useFilters();
  //const { status: sessionStatus } = useSession();
  const {
    data: retreatsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["retreats", filters],
    queryFn: () => getRetreats(filters),
    //enabled: sessionStatus === "authenticated",
    staleTime: 5 * 60 * 1000,
  });

  const handleView = (retreat: RetreatSimple) => {
    router.push(`public/retreats/${retreat.id}`);
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

  const retreatsDataArray: RetreatSimple[] = Array.isArray(retreatsData?.items)
    ? retreatsData?.items
    : ([retreatsData?.items] as unknown as RetreatSimple[]);

  if (isLoading || !retreatsDataArray.length)
    return <Typography>Loading retreats...</Typography>;
  if (isError) return <Typography>No data available.</Typography>;

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4, height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <Typography variant="h5">{t("retreats")}</Typography>
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
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
        }}
      >
        <PublicRetreatsCardTable
          total={retreatsData?.totalCount || 0}
          filters={filters}
          data={retreatsDataArray}
          onView={handleView}
          onFiltersChange={handleFiltersChange}
        />
      </Box>
    </Container>
  );
}
