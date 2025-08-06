"use client";

import { useState } from "react";
import { Button, Badge } from "@mui/material";
import { useTranslations } from "next-intl";
import Iconify from "../Iconify";
import DynamicFilters from ".";

interface FilterButtonProps<T = any, F = any> {
  filters: Filters<T, F>;
  defaultValues?: Partial<F>;
  onApplyFilters: (filters: Partial<F>) => void;
  onReset?: () => void;
  activeFiltersCount?: number;
}

export default function FilterButton<T = any, F = any>({
  filters,
  defaultValues,
  onApplyFilters,
  onReset,
  activeFiltersCount = 0,
}: FilterButtonProps<T, F>) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Badge badgeContent={activeFiltersCount} color="primary">
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleOpen}
          startIcon={<Iconify icon="solar:filter-bold" />}
        >
          {t("filters")}
        </Button>
      </Badge>

      <DynamicFilters
        open={open}
        onClose={handleClose}
        filters={filters}
        defaultValues={defaultValues}
        onApplyFilters={onApplyFilters}
        onReset={onReset}
      />
    </>
  );
}
