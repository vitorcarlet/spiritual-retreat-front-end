"use client";
import { Button, Container, Typography } from "@mui/material";
import RetreatsCardTable from "./CardTable/RetreatsCardTable";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
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
  RetreatRequest,
  RetreatsCardTableDateFilters,
  RetreatsCardTableFilters,
} from "./types";

const getRetreats = async (
  filters: TableDefaultFilters<
    RetreatsCardTableFilters & RetreatsCardTableDateFilters
  >
) => {
  const response = await handleApiResponse<RetreatRequest>(
    await sendRequestServerVanilla.get("/retreats", { params: filters })
  );

  if (!response || response.error) {
    throw new Error("Failed to fetch retreats");
  }
  console.log("Fetched reports:", response);
  return response.data as RetreatRequest;
};

export default function RetreatsTablePage() {
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

  const filtersConfig = getFilters();
  console.log(filters, "filters");
  const {
    data: retreatsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["retreats", filters],
    queryFn: () => getRetreats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes,
  });

  const handleEdit = (retreat: Retreat) => {
    router.push(`/retreats/${retreat.id}`);
  };

  const handleView = (retreat: Retreat) => {
    router.push(`/retreats/${retreat.id}`);
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

  console.log("Retreats data loaded:", retreatsData);
  const retreatsDataArray: Retreat[] = Array.isArray(retreatsData?.rows)
    ? retreatsData?.rows
    : ([retreatsData?.rows] as unknown as Retreat[]);

  if (isLoading) return <Typography>Loading retreats...</Typography>;
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
              Criar Novo Usuário
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
