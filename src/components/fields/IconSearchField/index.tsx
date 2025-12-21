'use client';
import React from 'react';

import { Autocomplete, Box, TextField } from '@mui/material';

import Iconify from '@/src/components/Iconify';

interface IconOption {
  name: string;
  label: string;
}

const iconOptions: IconOption[] = [
  { name: 'mdi:tshirt-crew', label: 'T-Shirt' },
  { name: 'mdi:home', label: 'Home' },
  { name: 'mdi:account', label: 'Account' },
  { name: 'mdi:calendar', label: 'Calendar' },
  { name: 'mdi:email', label: 'Email' },
  // Add more icons as needed...
];

interface IconSearchFieldProps {
  value: string;
  onChange: (icon: string) => void;
}

export default function IconSearchField({
  value,
  onChange,
}: IconSearchFieldProps) {
  return (
    <Autocomplete
      value={iconOptions.find((option) => option.name === value) || null}
      onChange={(_event, newValue) => {
        if (newValue) onChange(newValue.name);
      }}
      options={iconOptions}
      getOptionLabel={(option) => option.label}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;

        return (
          <Box
            key={key}
            padding={2}
            component="li"
            {...optionProps}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Iconify icon={option.name} width={20} height={20} sx={{ mr: 1 }} />
            {option.label}
          </Box>
        );
      }}
      renderInput={(params) => <TextField {...params} variant="outlined" />}
      fullWidth
      clearOnEscape
    />
  );
}
