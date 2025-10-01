"use client";

import React, { useMemo } from "react";

import MultiImageUpload from "@/src/components/fields/ImageUpload/MultiImageUpload";
import SingleImageUpload from "@/src/components/fields/ImageUpload/SingleImageUpload";

interface PhotoFieldInputProps {
  label?: string;
  placeholder?: string;
  multiple?: boolean;
  value: unknown;
  onChange: (value: File[] | File | null) => void;
  disabled?: boolean;
  helperText?: string;
  error?: boolean;
  required?: boolean;
}

const normalizeFileArray = (value: unknown): File[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is File => item instanceof File);
};

const normalizeSingleFile = (value: unknown): File | null => {
  if (value instanceof File) {
    return value;
  }
  return null;
};

const PhotoFieldInput: React.FC<PhotoFieldInputProps> = ({
  label,
  placeholder,
  multiple = false,
  value,
  onChange,
  disabled,
  helperText,
  error,
  required,
}) => {
  const labelWithAsterisk = useMemo(() => {
    const parts = [label, required ? "*" : null].filter(Boolean);
    return parts.join(" ") || undefined;
  }, [label, required]);

  const effectiveHelperText = useMemo(() => {
    if (error) return undefined;
    if (helperText) return helperText;
    if (placeholder) return placeholder;
    return undefined;
  }, [error, helperText, placeholder]);

  const errorText = error ? helperText : undefined;

  if (multiple) {
    const files = normalizeFileArray(value);

    return (
      <MultiImageUpload
        label={labelWithAsterisk}
        value={files}
        onChange={(filesList) => onChange(filesList)}
        disabled={disabled}
        helperText={effectiveHelperText}
        errorText={errorText}
      />
    );
  }

  const file = normalizeSingleFile(value);

  return (
    <SingleImageUpload
      label={labelWithAsterisk}
      value={file}
      onChange={(nextFile) => onChange(nextFile)}
      disabled={disabled}
      helperText={effectiveHelperText}
      errorText={errorText}
    />
  );
};

export default PhotoFieldInput;
