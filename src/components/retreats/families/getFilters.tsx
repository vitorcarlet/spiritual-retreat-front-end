import { useTranslations } from "next-intl";
import {
  RetreatsCardTableDateFilters,
  RetreatsCardTableFilters,
} from "../types";

type DateFilters = FiltersDate<ServiceOrdersReportsFilters>;

export const getDateFilters = (): DateFilters => {
  const t = useTranslations();
  return {
    // configKey,
    // variantDate: 'month',
    title: t("period"),
    variantDate: "dateRange",
  };
};

//type Filters = Filters;

export const getFilters = (): Filters<
  RetreatsCardTableFilters,
  RetreatsCardTableDateFilters
> => {
  const t = useTranslations();
  return {
    date: [
      // {
      //   variantDate: "dateRange",
      //   { title: t("periodStart"), filter: "periodStart" },
      //   { title: t("periodEnd"), filter: "periodEnd" },
      // }
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
    ],
  };
};
