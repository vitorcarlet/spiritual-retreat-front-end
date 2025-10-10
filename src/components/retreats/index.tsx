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
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  RetreatsCardTableDateFilters,
  RetreatsCardTableFilters,
} from "./types";
import { Retreat } from "@/src/types/retreats";
import { useModal } from "@/src/hooks/useModal";
import RetreatOverview from "./CardTable/RetreatOverview";
import {
  handleApiResponse,
  sendRequestClientVanilla,
} from "@/src/lib/sendRequestClientVanilla";
import apiClient from "@/src/lib/axiosClientInstance";

const getRetreats = async (
  filters: TableDefaultFilters<
    RetreatsCardTableFilters & RetreatsCardTableDateFilters
  >,
  token?: string | undefined
) => {
  try {
    const response = await apiClient.get("/retreats", {
      params: filters,
      // //requireAuth: false,
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // },
    });

    console.log(response, "vitor");
    // if (!response || response.status) {
    //   console.error("Retreats API error:", response?.error);
    //   throw new Error(response?.error ?? "Failed to fetch retreats");
    // }
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

  const { data: sessionData, status } = useSession();
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
  const accessToken = useMemo(() => {
    if (!sessionData) return undefined;
    const tokenFromTokens = (
      sessionData as { tokens?: { access_token?: string } }
    ).tokens?.access_token;
    if (tokenFromTokens) {
      return tokenFromTokens;
    }
    return (sessionData as { accessToken?: string })?.accessToken;
  }, [sessionData]);

  const {
    data: retreatsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["retreats", filters],
    queryFn: () => getRetreats(filters, accessToken),
    enabled: Boolean(accessToken),
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
  console.log(retreatsData, status, sessionData, "vitor");
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
