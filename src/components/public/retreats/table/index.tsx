"use client";
import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import {
  Box,
  Typography,
  Button,
  Chip,
  Grid,
  Pagination,
  Stack,
  Popover,
  MenuList,
  MenuItem,
  ListItemText,
} from "@mui/material";
import { RetreatsCardTableFilters } from "../types";
import { Retreat } from "@/src/types/retreats";
import Iconify from "@/src/components/Iconify";

interface RetreatsCardTableProps {
  data?: Retreat[];
  total?: number;
  filters: TableDefaultFilters<RetreatsCardTableFilters>;
  onView?: (retreat: Retreat) => void;
  onFiltersChange: (
    filters: TableDefaultFilters<RetreatsCardTableFilters>
  ) => void;
}

export default function PublicRetreatsCardTable({
  data,
  total,
  filters,
  onView,
  onFiltersChange,
}: RetreatsCardTableProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  // const searchParams = useSearchParams();
  // const router = useRouter();

  const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handlePageLimitChange = (newPageLimit: number) => {
    onFiltersChange({ pageLimit: newPageLimit });
    handlePopoverClose();
  };

  const open = Boolean(anchorEl);

  // Extrair filtros da URL

  // Define columns for TanStack Table
  const columns: ColumnDef<Retreat>[] = [
    {
      id: "card",
      cell: (row) => {
        const { original: retreat } = row.cell.row;

        // Define status color based on status value
        const statusColor = {
          open: {
            color: "success",
            sx: {
              bgcolor: "rgba(27, 73, 23, 0.61)",
              color: "rgba(72, 255, 0, 0.93)",
            },
          },
          closed: {
            color: "error",
            sx: {
              bgcolor: "rgba(97, 34, 26, 0.4)",
              color: "rgba(255, 30, 0, 0.93)",
            },
          },
          upcoming: {
            color: "warning",
            sx: {
              bgcolor: "rgba(73, 23, 23, 0.61)",
              color: "rgba(72, 255, 0, 0.93)",
            },
          },
          running: {
            color: "default",
            sx: {
              bgcolor: "rgba(99, 76, 15, 0.61)",
              color: "rgba(255, 196, 0, 0.86)",
            },
          },
          ended: {
            color: "info",
            sx: {
              bgcolor: "rgba(27, 73, 23, 0.61)",
              color: "rgba(101, 107, 106, 0.07)",
            },
          },
        } as const;

        // Status label text translation
        const statusText = {
          open: "open",
          closed: "closed",
          upcoming: "upcoming",
          running: "running",
          ended: "ended",
        };

        return (
          <Box
            sx={{
              width: 263,
              borderRadius: "8px",
              borderColor: "divider",
              borderStyle: "solid",
              borderWidth: 2,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: 304,
                position: "relative",
                borderColor: "divider",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                backgroundImage: `url(${retreat.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Gradient overlay */}
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  top: 0,
                  borderRadius: "8px 8px 0 0",
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.55) 5%, rgba(255, 255, 255, 0) 100%)",
                  zIndex: 1,
                }}
              />
              {/* Content */}
              <Box
                sx={{
                  position: "relative",
                  zIndex: 2,
                  p: 2,
                  color: "common.white",
                }}
              >
                <Chip
                  label={statusText[retreat.status]}
                  color={statusColor[retreat.status].color}
                  sx={{
                    mb: 1,
                    fontWeight: "medium",
                    bgcolor: statusColor[retreat.status].sx.bgcolor,
                    color: statusColor[retreat.status].sx.color,
                    borderStyle: "solid",
                    borderColor: "common.white",
                    borderWidth: 1,
                  }}
                />
                <Typography variant="h6" component="div" gutterBottom>
                  {retreat.title}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Iconify
                    icon="solar:map-point-bold"
                    sx={{ color: "common.white", mr: 0.5 }}
                  />
                  <Typography variant="body2" color="common.white">
                    {retreat.location}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                flex: 1,
                p: 2,
                pb: 1,
                borderRadius: "0 0 8px 8px",
                backgroundColor: "background.paper",
                display: "flex",
                alignContent: "center",
                justifyContent: "space-between",
              }}
            >
              <Button
                size="medium"
                variant="outlined"
                sx={{
                  width: "100%",
                  backgroundColor: "primary.main",
                  color: "white",
                  borderColor: "primary.main",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                    borderColor: "primary.dark",
                  },
                }}
                onClick={() => onView?.(retreat)}
              >
                Ver Mais
              </Button>
            </Box>
          </Box>
        );
      },
    },
  ];

  // Apply filters to data

  const page = filters.page || 1; // 1-based externo
  const pageLimit = filters.pageLimit || 8;
  // Total de itens e páginas
  const totalItems = total ?? data?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageLimit));

  // Set up the table instance
  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: {
      pagination: {
        pageIndex: page - 1, // 0-based interno
        pageSize: pageLimit,
      },
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({
              pageIndex: page - 1,
              pageSize: pageLimit,
            })
          : updater;

      // converter de volta para 1-based
      onFiltersChange({
        ...filters,
        page: next.pageIndex + 1,
        pageLimit: next.pageSize,
      });
    },
  });

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0, // importante para permitir o overflow interno
      }}
    >
      {/* Card grid */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0, // importante para permitir o overflow interno
          overflowY: "auto",
          pr: 0.5,
          pb: 2,
        }}
      >
        <Grid container spacing={3}>
          {table.getRowModel().rows.map((row) => (
            <Grid
              key={row.id}
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              display={"flex"}
              justifyContent={"center"}
            >
              {flexRender(
                row.getVisibleCells()[0].column.columnDef.cell,
                row.getVisibleCells()[0].getContext()
              )}
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Pagination controls */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
        mt={4}
      >
        <Button
          variant="outlined"
          size="small"
          endIcon={<Iconify icon="solar:alt-arrow-down-linear" />}
          onClick={handlePopoverOpen}
          sx={{ minWidth: 120 }}
        >
          {filters.pageLimit || 8} por página
        </Button>

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <MenuList>
            <MenuItem onClick={() => handlePageLimitChange(4)}>
              <ListItemText primary="4 por página" />
            </MenuItem>
            <MenuItem onClick={() => handlePageLimitChange(8)}>
              <ListItemText primary="8 por página" />
            </MenuItem>
            <MenuItem onClick={() => handlePageLimitChange(12)}>
              <ListItemText primary="12 por página" />
            </MenuItem>
            <MenuItem onClick={() => handlePageLimitChange(16)}>
              <ListItemText primary="16 por página" />
            </MenuItem>
          </MenuList>
        </Popover>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary" mr={2}>
            {table.getState().pagination.pageIndex + 1}-
            {Math.min(
              table.getState().pagination.pageIndex +
                table.getState().pagination.pageSize,
              data?.length ?? 0
            )}{" "}
            de {data?.length ?? 0}
          </Typography>
          <Pagination
            count={table.getPageCount()}
            page={table.getState().pagination.pageIndex + 1}
            onChange={(_, page) => onFiltersChange?.({ page: page })}
            color="primary"
          />
        </Box>
      </Stack>
    </Box>
  );
}
