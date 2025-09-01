// Campos padrão sempre disponíveis
interface BaseReportColumn {
  key: string; // ex: 'name'
  label: string; // ex: 'Nome'
  type?: "string" | "number" | "date" | "enum";
  fixed?: boolean; // não pode ser desmarcado (ex: id)
  defaultVisible?: boolean;
}

// Campos custom vindos do formulário do retiro
interface CustomFieldDefinition {
  key: string; // ex: 'tshirtSize'
  label: string; // 'Tamanho Camisa'
  inputType: string; // text, select, date...
  group?: string; // ex: 'Informações Adicionais'
}

interface ReportGeneratorConfig {
  baseColumns: BaseReportColumn[];
  customFields: CustomFieldDefinition[];
}

export type { BaseReportColumn, CustomFieldDefinition, ReportGeneratorConfig };
