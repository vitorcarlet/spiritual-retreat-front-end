import { DataTableColumn } from "@/src/components/table/DataTable";

export const columnsMock: DataTableColumn<any>[] = [
  {
    field: "id",
    headerName: "ID",
    type: "string",
    origin: "reportField",
  },
  {
    field: "name",
    headerName: "Nome",
    type: "string",
    origin: "reportField",
  },
  {
    field: "participation",
    headerName: "Participação",
    type: "string",
    origin: "reportField",
  },
  {
    field: "payment",
    headerName: "Status de Pagamento",
    type: "string",
    origin: "reportField",
  },
  {
    field: "shirtSize",
    headerName: "Tamanho da Camiseta",
    type: "customField",
    origin: "customField",
  },
];
