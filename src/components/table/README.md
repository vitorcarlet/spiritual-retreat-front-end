# DataTable Component

Um componente de tabela altamente reutilizável baseado no MUI X DataGrid com virtualização e recursos avançados.

## Recursos

- ✅ **Virtualização**: Performance otimizada para grandes datasets
- ✅ **Paginação**: Client-side e server-side
- ✅ **Filtros**: Filtros avançados por coluna
- ✅ **Ordenação**: Suporte a ordenação múltipla
- ✅ **Seleção**: Seleção múltipla com checkboxes
- ✅ **Redimensionamento**: Colunas redimensionáveis
- ✅ **Visibilidade**: Ocultar/mostrar colunas
- ✅ **Densidade**: Ajustável (compacta, padrão, confortável)
- ✅ **Exportação**: CSV e Excel
- ✅ **Ações**: Ações personalizadas por linha
- ✅ **Responsivo**: Design responsivo
- ✅ **Acessível**: Totalmente acessível
- ✅ **Localização**: Interface em português

## Uso Básico

```tsx
import { DataTable, DataTableColumn } from "@/src/components/table";

interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

const columns: DataTableColumn<User>[] = [
  {
    field: "id",
    headerName: "ID",
    width: 70,
    type: "number",
  },
  {
    field: "name",
    headerName: "Nome",
    width: 200,
    flex: 1,
  },
  {
    field: "email",
    headerName: "Email",
    width: 250,
    flex: 1,
  },
];

const data: User[] = [
  { id: 1, name: "João", email: "joao@email.com", status: "active" },
  { id: 2, name: "Maria", email: "maria@email.com", status: "inactive" },
];

function MyTable() {
  return (
    <DataTable
      rows={data}
      columns={columns}
      title="Usuários"
      subtitle="Lista de usuários do sistema"
      height={400}
    />
  );
}
```

## Configurações Avançadas

### Paginação

```tsx
<DataTable
  rows={data}
  columns={columns}
  pagination={true}
  pageSize={25}
  pageSizeOptions={[10, 25, 50, 100]}
  paginationMode="client" // ou "server"
  rowCount={totalRows} // Para server-side
  onPaginationModelChange={(model) => {
    // Lógica para server-side pagination
  }}
/>
```

### Seleção Múltipla

```tsx
const [selectedRows, setSelectedRows] = useState<GridRowId[]>([]);

<DataTable
  rows={data}
  columns={columns}
  checkboxSelection={true}
  rowSelectionModel={selectedRows}
  onRowSelectionModelChange={setSelectedRows}
/>
```

### Ações Personalizadas

```tsx
<DataTable
  rows={data}
  columns={columns}
  actions={[
    {
      icon: "lucide:eye",
      label: "Visualizar",
      onClick: (row) => console.log("Ver", row),
      color: "info",
    },
    {
      icon: "lucide:edit",
      label: "Editar",
      onClick: (row) => console.log("Editar", row),
      color: "primary",
    },
    {
      icon: "lucide:trash-2",
      label: "Deletar",
      onClick: (row) => console.log("Deletar", row),
      color: "error",
      disabled: (row) => row.status === "protected",
    },
  ]}
/>
```

### Renderização Customizada

```tsx
const columns: DataTableColumn<User>[] = [
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.value === "active" ? "Ativo" : "Inativo"}
        color={params.value === "active" ? "success" : "error"}
        size="small"
      />
    ),
  },
];
```

### Filtros e Ordenação Server-Side

```tsx
<DataTable
  rows={data}
  columns={columns}
  filterMode="server"
  sortingMode="server"
  onSortModelChange={(model) => {
    // Implementar ordenação no servidor
  }}
  onFilterModelChange={(model) => {
    // Implementar filtros no servidor
  }}
/>
```

### Virtualização Otimizada

```tsx
<DataTable
  rows={largeDataset}
  columns={columns}
  rowBuffer={10} // Linhas extras para renderizar
  columnBuffer={3} // Colunas extras para renderizar
  height={600}
/>
```

## Props do DataTableProps

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `rows` | `T[]` | - | Dados da tabela |
| `columns` | `DataTableColumn<T>[]` | - | Configuração das colunas |
| `loading` | `boolean` | `false` | Estado de carregamento |
| `height` | `number \| string` | `600` | Altura da tabela |
| `autoHeight` | `boolean` | `false` | Altura automática |
| `pagination` | `boolean` | `true` | Habilitar paginação |
| `pageSize` | `number` | `25` | Tamanho da página |
| `pageSizeOptions` | `number[]` | `[10, 25, 50, 100]` | Opções de tamanho |
| `checkboxSelection` | `boolean` | `false` | Seleção múltipla |
| `toolbar` | `boolean` | `true` | Mostrar toolbar |
| `title` | `string` | - | Título da tabela |
| `subtitle` | `string` | - | Subtítulo da tabela |
| `actions` | `Action[]` | - | Ações por linha |
| `density` | `'compact' \| 'standard' \| 'comfortable'` | `'standard'` | Densidade da tabela |

## Props do DataTableColumn

| Prop | Tipo | Descrição |
|------|------|-----------|
| `field` | `keyof T \| string` | Campo dos dados |
| `headerName` | `string` | Nome do cabeçalho |
| `width` | `number` | Largura fixa |
| `flex` | `number` | Largura flexível |
| `type` | `'string' \| 'number' \| 'date' \| 'boolean'` | Tipo da coluna |
| `sortable` | `boolean` | Permitir ordenação |
| `filterable` | `boolean` | Permitir filtros |
| `renderCell` | `(params) => ReactNode` | Renderização customizada |

## Exemplo Completo

Veja o arquivo `DataTableExample.tsx` para um exemplo completo com todas as funcionalidades.

## Performance

O componente utiliza virtualização automática do MUI X DataGrid, que renderiza apenas as linhas e colunas visíveis, garantindo excelente performance mesmo com milhares de registros.

### Dicas de Performance

1. **Virtualização**: Use `rowBuffer` e `columnBuffer` para ajustar quantas linhas/colunas extras renderizar
2. **Paginação Server-Side**: Para datasets muito grandes, use `paginationMode="server"`
3. **Memoização**: Use `React.memo` nos componentes de renderização customizada
4. **getRowId**: Forneça uma função `getRowId` para melhor performance de atualização

## Acessibilidade

O componente é totalmente acessível e suporta:
- Navegação por teclado
- Screen readers
- Focus management
- ARIA labels
- Contraste adequado

## Customização de Tema

O componente herda automaticamente o tema MUI configurado e pode ser customizado via CSS-in-JS:

```tsx
<DataTable
  rows={data}
  columns={columns}
  sx={{
    '& .MuiDataGrid-row': {
      '&:hover': {
        backgroundColor: 'custom.hover',
      },
    },
  }}
/>
```
