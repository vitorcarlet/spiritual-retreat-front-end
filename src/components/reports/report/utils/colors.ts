export const fallbackFamilyColor = "#1976d2";

export const normalizeHexColor = (color?: string) => {
  if (!color) return fallbackFamilyColor;
  const trimmed = color.trim();
  if (!trimmed) return fallbackFamilyColor;
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
};

export const hexToRgb = (hex?: string) => {
  const normalized = normalizeHexColor(hex).replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;
  const parsed = Number.parseInt(value, 16);
  const intValue = Number.isNaN(parsed)
    ? Number.parseInt(fallbackFamilyColor.replace("#", ""), 16)
    : parsed;
  const r = (intValue >> 16) & 255;
  const g = (intValue >> 8) & 255;
  const b = intValue & 255;
  return { r, g, b };
};

export const getContrastingTextColor = (hex?: string) => {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? { r: 33, g: 33, b: 33 } : { r: 255, g: 255, b: 255 };
};
