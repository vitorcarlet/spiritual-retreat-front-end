import { useTranslations } from "next-intl";
import { ReportsTableDateFilters, ReportsTableFilters } from "../types";

type DateFilters = FiltersDate<UsersTableDateFilters>;

export const getDateFilters = (): DateFilters => {
  const t = useTranslations();
  return {
    // configKey,
    variantDate: "dateRange",
    title: t("period"),
  };
};

//type Filters = Filters;

export const getFilters = (
  id: string
): Filters<ReportsTableFilters, ReportsTableDateFilters> => {
  const t = useTranslations();
  return {
    //variantDate: "dateRange",
    date: [
      { title: t("periodStart"), filter: "periodStart" },
      { title: t("periodEnd"), filter: "periodEnd" },
    ],
    items: [
      {
        title: t("status"),
        fields: [
          {
            typeField: "selectAutocomplete",
            name: "status",
            primaryKey: "value",
            onlyFirstLoad: true,
            url: `models/filter/status/serviceOrders?type=F`,
            isMultiple: true,
            custom: { variant: "custom" },
          },
        ],
      },
      {
        title: t("city"),
        fields: [
          {
            typeField: "selectAutocomplete",
            name: "city",
            url: "clients/filter/city",
            onlyFirstLoad: true,
            isMultiple: true,
            custom: { variant: "custom" },
          },
        ],
      },
      {
        title: t("report-data"),
        fields: [
          {
            typeField: "selectAutocomplete",
            name: "name",
            url: "reports/filter/name",
            onlyFirstLoad: true,
            isMultiple: true,
            custom: { variant: "custom" },
          },
        ],
      },
      {
        title: t("custom-fields"),
        fields: [
          {
            typeField: "selectAutocomplete",
            name: "name",
            url: `reports/${id}/filter/customFields`,
            onlyFirstLoad: true,
            isMultiple: true,
            custom: { variant: "custom" },
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
