/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Box,
  Stack,
  Chip,
  Typography,
  TextField,
  CircularProgress,
  Container,
  Button,
} from "@mui/material";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
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
import RetreatTentsTable from "./RetreatTentsTable";

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
    throw new Error("Failed to fetch tents");
  }
  return response.data as unknown as RetreatTentRequest;
};

interface RetreatTentsProps {
  id: string;
}

export default function RetreatTents({ id: retreatId }: RetreatTentsProps) {
  const t = useTranslations();
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
          permission: "retreats.createTents",
          role: session.data.user.role,
        })
      );
    }
  }, [session.data]);

  const filtersConfig = getFilters();
  const {
    data: tentsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["retreat-tents", filters],
    queryFn: () => getRetreatTents(filters, retreatId),
    staleTime: 60_000,
  });

  const handleEdit = (retreat: RetreatTent) => {
    //router.push(`/retreats/${retreat.id}`);
  };

  const handleView = (retreat: RetreatTent) => {
    //router.push(`/retreats/${retreat.id}`);
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

  const tentsDataArray: RetreatTent[] = Array.isArray(tentsData?.rows)
    ? tentsData?.rows
    : ([tentsData?.rows] as unknown as RetreatTent[]);

  if (isLoading) return <Typography>Loading tents...</Typography>;
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
        <Typography variant="h5">{t("retreats-families")}</Typography>
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
          <RetreatTentsTable
            total={tentsData?.total || 0}
            filters={filters}
            items={tentsDataArray!}
            onEdit={handleEdit}
            onView={handleView}
            onFiltersChange={handleFiltersChange}
            //handle={hasCreatePermission}
            handle={true}
          />
        )}
      </Box>
    </Container>
  );
}
