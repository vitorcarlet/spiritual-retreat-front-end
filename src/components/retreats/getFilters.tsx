import { useTranslations } from "next-intl";

type DateFilters = FiltersDate<ServiceOrdersReportsFilters>;

export const getDateFilters = (): DateFilters => {
  const t = useTranslations();
  return {
    // configKey,
    // variantDate: 'month',
    title: t("period"),
    filter: "period",
  };
};

//type Filters = Filters;

export const getFilters = (): Filters => {
  const t = useTranslations();
  return {
    date: [{ title: t("period"), variantDate: "month" }],
    items: [
      // ...configKey,
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
