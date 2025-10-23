"use client";
import { Button, Container, Typography } from "@mui/material";
import RetreatsCardTable from "./CardTable/RetreatsCardTable";

import { useQuery } from "@tanstack/react-query";
import { Box, Stack } from "@mui/material";
import FilterButton from "@/src/components/filters/FilterButton";
import { getFilters } from "./CardTable/getFilters";
import { useTranslations } from "next-intl";
import { useUrlFilters } from "@/src/hooks/useUrlFilters";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import getPermission from "@/src/utils/getPermission";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RetreatsCardTableDateFilters,
  RetreatsCardTableFilters,
} from "./types";
import { Retreat } from "@/src/types/retreats";
import { useModal } from "@/src/hooks/useModal";
import RetreatOverview from "./CardTable/RetreatOverview";
import apiClient from "@/src/lib/axiosClientInstance";
import { keysToRemoveFromFilters } from "../table/shared";

const getRetreats = async (
  filters: TableDefaultFilters<
    RetreatsCardTableFilters & RetreatsCardTableDateFilters
  >
) => {
  try {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageLimit =
      filters.pageLimit && filters.pageLimit > 0 ? filters.pageLimit : 20;
    const skip = (page - 1) * pageLimit;
    const filtersFiltered = keysToRemoveFromFilters.forEach(
      (key) => delete filters[key]
    );
    const params: Record<string, unknown> = {
      status: 1,
      skip,
      take: pageLimit,
      filtersFiltered,
    };
    const response = await apiClient.get("/Retreats", {
      params,
    });

    return response.data;
  } catch (err) {
    console.error("getRetreats: ", err);
    throw err;
  }
};

export default function RetreatsTablePage() {
  const t = useTranslations();
  const router = useRouter();
  const modal = useModal();
  const { filters, updateFilters, activeFiltersCount, resetFilters } =
    useUrlFilters<TableDefaultFilters<RetreatsCardTableFilters>>({
      defaultFilters: {
        page: 1,
        pageLimit: 4,
      },
      excludeFromCount: ["page", "pageLimit"], // Don't count pagination in active filters
    });

  const { data: sessionData } = useSession();
  const [hasCreatePermission, setHasCreatePermission] = useState(false);

  useEffect(() => {
    if (sessionData && sessionData.user) {
      setHasCreatePermission(
        getPermission({
          permissions: sessionData.user.permissions,
          permission: "users.create",
          role: sessionData.user.role,
        })
      );
    }
  }, [sessionData]);

  const filtersConfig = getFilters();

  const {
    data: retreatsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["retreats", filters],
    queryFn: () => getRetreats(filters),
    staleTime: 5 * 60 * 1000,
  });

  const handleEdit = (retreat: Retreat) => {
    router.push(`/retreats/${retreat.id}`);
  };

  const handleView = (retreat: Retreat) => {
    modal.open({
      title: t("overview"),
      size: "lg",
      customRender() {
        return <RetreatOverview retreatId={String(retreat.id)} />;
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

  const retreatsDataArray: Retreat[] = Array.isArray(retreatsData?.rows)
    ? retreatsData?.rows
    : ([retreatsData?.rows] as unknown as Retreat[]);

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
        {hasCreatePermission && (
          <Button variant="contained">
            <Link href={{ pathname: "/dashboard/retreats/new" }}>
              Criar Novo Retiro
            </Link>
          </Button>
        )}
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
        }}
      >
        <RetreatsCardTable
          loading={isLoading}
          total={retreatsData?.total || 0}
          filters={filters}
          data={retreatsDataArray}
          onEdit={handleEdit}
          onView={handleView}
          onFiltersChange={handleFiltersChange}
        />
      </Box>
    </Container>
  );
}
