import { ReportsTableDateFilters, ReportsTableFilters } from "../types";

export const getFilters = (): Filters<
  ReportsTableFilters,
  ReportsTableDateFilters
> => {
  return {
    items: [
      {
        title: "Status",
        fields: [
          {
            typeField: "selectMultiple",
            name: "status",
            options: [
              { label: "Não Selecionado", value: "NotSelected" },
              { label: "Selecionado", value: "Selected" },
              { label: "Pagamento Pendente", value: "PendingPayment" },
              { label: "Pagamento Confirmado", value: "PaymentConfirmed" },
              { label: "Confirmado", value: "Confirmed" },
              { label: "Cancelado", value: "Canceled" },
            ],
          },
        ],
      },
      {
        title: "Gênero",
        fields: [
          {
            typeField: "selectMultiple",
            name: "gender",
            options: [
              { label: "Masculino", value: "Male" },
              { label: "Feminino", value: "Female" },
            ],
          },
        ],
      },
      {
        title: "Idade",
        fields: [
          {
            typeField: "number",
            name: "minAge",
            placeholder: "Idade mínima",
          },
          {
            typeField: "number",
            name: "maxAge",
            placeholder: "Idade máxima",
          },
        ],
      },
      {
        title: "Cidade",
        fields: [
          {
            typeField: "text",
            name: "city",
            placeholder: "Buscar por cidade",
          },
        ],
      },
      {
        title: "Estado",
        fields: [
          {
            typeField: "selectMultiple",
            name: "state",
            options: [
              { label: "Acre", value: "AC" },
              { label: "Alagoas", value: "AL" },
              { label: "Amapá", value: "AP" },
              { label: "Amazonas", value: "AM" },
              { label: "Bahia", value: "BA" },
              { label: "Ceará", value: "CE" },
              { label: "Distrito Federal", value: "DF" },
              { label: "Espírito Santo", value: "ES" },
              { label: "Goiás", value: "GO" },
              { label: "Maranhão", value: "MA" },
              { label: "Mato Grosso", value: "MT" },
              { label: "Mato Grosso do Sul", value: "MS" },
              { label: "Minas Gerais", value: "MG" },
              { label: "Pará", value: "PA" },
              { label: "Paraíba", value: "PB" },
              { label: "Paraná", value: "PR" },
              { label: "Pernambuco", value: "PE" },
              { label: "Piauí", value: "PI" },
              { label: "Rio de Janeiro", value: "RJ" },
              { label: "Rio Grande do Norte", value: "RN" },
              { label: "Rio Grande do Sul", value: "RS" },
              { label: "Rondônia", value: "RO" },
              { label: "Roraima", value: "RR" },
              { label: "Santa Catarina", value: "SC" },
              { label: "São Paulo", value: "SP" },
              { label: "Sergipe", value: "SE" },
              { label: "Tocantins", value: "TO" },
              { label: "Exterior", value: "EX" },
            ],
          },
        ],
      },
      {
        title: "Possui Foto",
        fields: [
          {
            typeField: "selectMultiple",
            name: "hasPhoto",
            options: [
              { label: "Sim", value: "true" },
              { label: "Não", value: "false" },
            ],
          },
        ],
      },
    ],
  };
};

// {
//   "baseColumns": [
//     { "key": "id", "label": "ID", "fixed": true },
//     { "key": "name", "label": "Nome", "defaultVisible": true },
//     { "key": "status", "label": "Status", "defaultVisible": true },
//     { "key": "createdAt", "label": "Criado em" }
//   ],
//   "customFields": [
//     { "key": "tshirtSize", "label": "Tamanho Camisa", "inputType": "select" },
//     { "key": "allergies", "label": "Alergias", "inputType": "text" }
//   ]
// }
