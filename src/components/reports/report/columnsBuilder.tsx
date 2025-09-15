import { Box, Chip, Typography } from "@mui/material";
import { DataTableColumn } from "../../table/DataTable";
import { format } from "date-fns";
import { Report } from "@/src/types/reports";

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
  (d: ColumnDescriptor) => DataTableColumn<Report>
> = {
  id: (d) => ({
    field: "id",
    headerName: d.headerName || "ID",
    type: "string",
    width: d.width ?? 80,
  }),
  name: (d) => ({
    field: "name",
    headerName: d.headerName || "Nome",
    flex: d.flex ?? 1,
    minWidth: d.minWidth ?? 180,
    renderCell: (params) => (
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
        {params.value}
      </Box>
    ),
  }),
  sections: (d) => ({
    field: "sections",
    headerName: d.headerName || "Seções",
    flex: d.flex ?? 1,
    minWidth: d.minWidth ?? 220,
    renderCell: (params) => (
      <Box>
        {Array.isArray(params.value) && params.value.length > 0 ? (
          params.value.map((section: string, index: number) => (
            <Chip key={index} label={section} size="small" color="primary" />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            Nenhuma seção disponível
          </Typography>
        )}
      </Box>
    ),
  }),
  dateCreation: (d) => ({
    field: "dateCreation",
    headerName: d.headerName || "Criado em",
    width: d.width ?? 160,
    valueFormatter: (v: any) =>
      v?.value ? format(new Date(v.value), "dd/MM/yyyy - HH:mm") : "",
  }),
  retreatName: (d) => ({
    field: "retreatName",
    headerName: d.headerName || "Retiro",
    flex: d.flex ?? 1,
    minWidth: d.minWidth ?? 160,
  }),
};

// Fallback genérico por tipo
const defaultBuilder = (d: ColumnDescriptor): DataTableColumn<Report> => {
  const header = d.headerName || defaultHeader(d.field);
  if (d.type === "date") {
    return {
      field: d.field as keyof Report,
      headerName: header,
      width: d.width ?? 160,
      valueFormatter: (v: any) =>
        v?.value ? format(new Date(v.value), "dd/MM/yyyy") : "",
    };
  }
  if (d.type === "boolean") {
    return {
      field: d.field as keyof Report,
      headerName: header,
      width: d.width ?? 120,
      valueFormatter: (v: any) => (v?.value ? "Sim" : "Não"),
    };
  }
  // string/number/custom
  return {
    field: d.field as keyof Report,
    headerName: header,
    flex: d.flex ?? 1,
    minWidth: d.minWidth ?? 140,
  };
};

export function buildReportColumns({ descriptors }: BuildParams) {
  return descriptors.map((d) => {
    const h = handlers[d.field];
    return h ? h(d) : defaultBuilder(d);
  });
}