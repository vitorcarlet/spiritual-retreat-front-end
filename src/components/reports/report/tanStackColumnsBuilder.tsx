import { Box, Chip, Typography } from "@mui/material";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export type ColumnDescriptor = {
  field: string;
  headerName?: string;
  type?: "string" | "number" | "date" | "boolean";
  origin?: "reportField" | "customField";
  minWidth?: number;
  width?: number;
  flex?: number;
};

type BuildParams = {
  descriptors: ColumnDescriptor[];
};

const defaultHeader = (field: string) =>
  field
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());

// Handlers por campo conhecido
const handlers: Record<
  string,
  (d: ColumnDescriptor) => ColumnDef<Record<string, unknown>>
> = {
  id: (d) => ({
    accessorKey: "id",
    header: d.headerName || "ID",
    size: d.width ?? 80,
    enableColumnFilter: false,
  }),
  name: (d) => ({
    accessorKey: "name",
    header: d.headerName || "Nome",
    size: d.minWidth ?? 180,
    cell: (info) => (
      <Box
        component="span"
        sx={{
          fontSize: 14,
          fontWeight: 500,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 200,
        }}
      >
        {String(info.getValue() ?? "")}
      </Box>
    ),
  }),
  sections: (d) => ({
    accessorKey: "sections",
    header: d.headerName || "Seções",
    size: d.minWidth ?? 220,
    enableSorting: false,
    cell: (info) => {
      const value = info.getValue();
      return (
        <Box>
          {Array.isArray(value) && value.length > 0 ? (
            value.map((section, index) => (
              <Chip
                key={index}
                label={String(section)}
                size="small"
                color="primary"
                sx={{ mr: 0.5 }}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nenhuma seção disponível
            </Typography>
          )}
        </Box>
      );
    },
  }),
  dateCreation: (d) => ({
    accessorKey: "dateCreation",
    header: d.headerName || "Criado em",
    size: d.width ?? 160,
    cell: (info) => {
      const value = info.getValue();
      return value
        ? format(new Date(value as string), "dd/MM/yyyy - HH:mm")
        : "";
    },
  }),
  registrationDate: (d) => ({
    accessorKey: "registrationDate",
    header: d.headerName || "Data de Inscrição",
    size: d.width ?? 160,
    cell: (info) => {
      const value = info.getValue();
      return value
        ? format(new Date(value as string), "dd/MM/yyyy - HH:mm")
        : "";
    },
  }),
  retreatName: (d) => ({
    accessorKey: "retreatName",
    header: d.headerName || "Retiro",
    size: d.minWidth ?? 160,
  }),
};

// Fallback genérico por tipo
const defaultBuilder = (
  d: ColumnDescriptor
): ColumnDef<Record<string, unknown>> => {
  const header = d.headerName || defaultHeader(d.field);

  if (d.type === "date") {
    return {
      accessorKey: d.field,
      header,
      size: d.width ?? 160,
      cell: (info) => {
        const value = info.getValue();
        return value ? format(new Date(value as string), "dd/MM/yyyy") : "";
      },
    };
  }

  if (d.type === "boolean") {
    return {
      accessorKey: d.field,
      header,
      size: d.width ?? 120,
      cell: (info) => (info.getValue() ? "Sim" : "Não"),
    };
  }

  if (d.type === "number") {
    return {
      accessorKey: d.field,
      header,
      size: d.width ?? 140,
      meta: {
        filterVariant: "number",
      },
    };
  }

  // string/custom
  return {
    accessorKey: d.field,
    header,
    size: d.minWidth ?? 140,
  };
};

export function buildTanStackReportColumns({ descriptors }: BuildParams) {
  return descriptors.map((d) => {
    const h = handlers[d.field];
    return h ? h(d) : defaultBuilder(d);
  });
}
