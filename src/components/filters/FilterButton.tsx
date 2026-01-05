'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { Badge, Button } from '@mui/material';

import DynamicFilters from '.';
import Iconify from '../Iconify';

// 1. Add default type " = T" here
interface FilterButtonProps<T, F = T> {
  filters: Filters<T, F>;
  defaultValues?: Partial<TableDefaultFilters<F>>;
  onApplyFilters: (filters: Partial<Filters<T, F>>) => void;
  onReset?: () => void;
  activeFiltersCount?: number;
  fullWidth?: boolean;
}

export type allFilters<T, F> = T extends F ? T : never;

// 2. Add default type " = T" here as well
export default function FilterButton<T, F = T>({
  filters,
  defaultValues,
  onApplyFilters,
  onReset,
  activeFiltersCount = 0,
  fullWidth = false,
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
      <Badge
        badgeContent={activeFiltersCount}
        color="primary"
        sx={{ width: fullWidth ? '100%' : 'auto' }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleOpen}
          startIcon={<Iconify icon="solar:filter-bold" />}
          fullWidth={fullWidth}
          sx={{ height: 40 }}
        >
          {t('filters')}
        </Button>
      </Badge>

      <DynamicFilters<T, F>
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
