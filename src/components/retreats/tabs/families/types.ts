import {
  CancelDrop,
  KeyboardCoordinateGetter,
  Modifiers,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { SortingStrategy } from "@dnd-kit/sortable";
import { RetreatsCardTableFilters } from "../../types";

export interface RetreatFamiliesProps {
  adjustScale?: boolean;
  cancelDrop?: CancelDrop;
  columns?: number;
  containerStyle?: React.CSSProperties;
  coordinateGetter?: KeyboardCoordinateGetter;
  getItemStyles?(args: {
    value: UniqueIdentifier;
    index: number;
    overIndex: number;
    isDragging: boolean;
    containerId: UniqueIdentifier;
    isSorting: boolean;
    isDragOverlay: boolean;
  }): React.CSSProperties;
  wrapperStyle?(args: { index: number }): React.CSSProperties;
  itemCount?: number;
  items?: RetreatFamily[];
  handle?: boolean;
  renderItem?: unknown;
  strategy?: SortingStrategy;
  modifiers?: Modifiers;
  minimal?: boolean;
  trashable?: boolean;
  scrollable?: boolean;
  vertical?: boolean;
  onFiltersChange: (
    filters: TableDefaultFilters<RetreatsCardTableFilters>
  ) => void;
  filters: TableDefaultFilters<RetreatsCardTableFilters>;
  onEdit: (familyId: UniqueIdentifier) => void;
  onView: (familyId: UniqueIdentifier) => void;
  total: number;
}

export type Items = Record<string, UniqueIdentifier[]>;
