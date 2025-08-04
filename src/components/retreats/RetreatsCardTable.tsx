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
  Card,
  CardMedia,
  CardContent,
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
          aberto: "success",
          fechado: "error",
          em_breve: "warning",
          encerrado: "default",
        } as const;

        // Status label text translation
        const statusText = {
          aberto: "Aberto",
          fechado: "Fechado",
          em_breve: "Em breve",
          encerrado: "Encerrado",
        };

        return (
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <Box sx={{ position: "relative" }}>
              <CardMedia
                component="img"
                height="200"
                image={retreat.image}
                alt={retreat.title}
              />
              <Chip
                label={statusText[retreat.status]}
                color={statusColor[retreat.status]}
                sx={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  fontWeight: "medium",
                }}
              />
            </Box>
            <CardContent sx={{ flexGrow: 1, pb: 0 }}>
              <Typography variant="h6" component="div" gutterBottom>
                {retreat.title}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Iconify
                  icon="solar:map-point-bold"
                  sx={{ color: "text.secondary", mr: 0.5 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {retreat.location}
                </Typography>
              </Box>
            </CardContent>
            <Box
              sx={{
                p: 2,
                pt: 0,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => onView?.(retreat)}
              >
                Ver mais
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => onEdit?.(retreat)}
              >
                Editar
              </Button>
            </Box>
          </Card>
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
          <Grid key={row.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
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
