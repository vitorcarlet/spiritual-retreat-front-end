"use client";
import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import {
  Box,
  Typography,
  Button,
  Chip,
  Grid,
  TextField,
  InputAdornment,
  Pagination,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import Iconify from "../Iconify";

interface RetreatsCardTableProps {
  data: Retreat | Retreat[] | undefined;
  onEdit?: (retreat: Retreat) => void;
  onView?: (retreat: Retreat) => void;
}

export default function RetreatsCardTable({
  data,
  onEdit,
  onView,
}: RetreatsCardTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // Define columns for TanStack Table
  const columns: ColumnDef<Retreat>[] = [
    {
      id: "card",
      cell: ({ row }) => {
        const retreat = row.original;

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
                  width: 100,
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
                Ver mais
              </Button>
              <Button
                sx={{ width: 100 }}
                size="medium"
                variant="outlined"
                onClick={() => onEdit?.(retreat)}
              >
                Editar
              </Button>
            </Box>
          </Box>
        );
      },
    },
  ];

  // Apply filters to data
  const filteredData = data.filter((retreat) => {
    // Text search filter
    const textMatch =
      retreat.title.toLowerCase().includes(globalFilter.toLowerCase()) ||
      retreat.location.toLowerCase().includes(globalFilter.toLowerCase());

    // Status filter
    const statusMatch =
      statusFilter === "todos" || retreat.status === statusFilter;

    return textMatch && statusMatch;
  });

  // Set up the table instance
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination: {
        pageSize: rowsPerPage,
        pageIndex: 0,
      },
    },
    initialState: {
      pagination: {
        pageSize: rowsPerPage,
      },
    },
  });

  return (
    <Box>
      {/* Filters and search bar */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            placeholder="Buscar"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:magnifer-line-duotone" />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="aberto">Aberto</MenuItem>
              <MenuItem value="fechado">Fechado</MenuItem>
              <MenuItem value="em_breve">Em breve</MenuItem>
              <MenuItem value="encerrado">Encerrado</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid
          size={{ xs: 12, sm: 6, md: 5 }}
          sx={{ display: "flex", justifyContent: "flex-end" }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
          >
            Novo retiro
          </Button>
        </Grid>
      </Grid>

      {/* Card grid */}
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

      {/* Pagination controls */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
        mt={4}
      >
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            displayEmpty
          >
            <MenuItem value={4}>4 por linha</MenuItem>
            <MenuItem value={8}>8 por linha</MenuItem>
            <MenuItem value={12}>12 por linha</MenuItem>
            <MenuItem value={16}>16 por linha</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary" mr={2}>
            {table.getState().pagination.pageIndex + 1}-
            {Math.min(
              table.getState().pagination.pageIndex +
                table.getState().pagination.pageSize,
              filteredData.length
            )}{" "}
            de {filteredData.length}
          </Typography>
          <Pagination
            count={table.getPageCount()}
            page={table.getState().pagination.pageIndex + 1}
            onChange={(_, page) => table.setPageIndex(page - 1)}
            color="primary"
          />
        </Box>
      </Stack>
    </Box>
  );
}
