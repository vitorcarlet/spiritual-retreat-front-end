import type {
  CancelDrop,
  KeyboardCoordinateGetter,
  Modifiers,
  UniqueIdentifier,
} from "@dnd-kit/core";
import type { RetreatsCardTableFilters } from "../../types";
import { SortingStrategy } from "@dnd-kit/sortable";

export interface ServiceSpaceTableProps {
  retreatId: string;
  canEditServiceTeam: boolean;
  adjustScale?: boolean;
  items: ServiceSpace[];
  cancelDrop?: CancelDrop;
  total: number;
  handle?: boolean;
  containerStyle?: React.CSSProperties;
  coordinateGetter?: KeyboardCoordinateGetter;
  wrapperStyle?(args: { index: number }): React.CSSProperties;
  minimal?: boolean;
  modifiers?: Modifiers;
  strategy?: SortingStrategy;
  trashable?: boolean;
  scrollable?: boolean;
  vertical?: boolean;
  setServiceTeamReorderFlag: (flag: boolean) => void;
  getItemStyles?(args: {
    value: UniqueIdentifier;
    index: number;
    overIndex: number;
    isDragging: boolean;
    containerId: UniqueIdentifier;
    isSorting: boolean;
    isDragOverlay: boolean;
  }): React.CSSProperties;
  filters: TableDefaultFilters<RetreatsCardTableFilters>;
  onFiltersChange: (
    filters: TableDefaultFilters<RetreatsCardTableFilters>
  ) => void;
  onView: (spaceId: UniqueIdentifier) => void;
  onEdit: (spaceId: UniqueIdentifier) => void;
  onDelete?: (spaceId: UniqueIdentifier) => void;
  canEdit: boolean;
  onSaveReorder?: (items: Items) => Promise<void>;
  setReorderFlag?: (flag: boolean) => void;
}

export type Items = Record<string, UniqueIdentifier[]>;

export type MembersById = Record<UniqueIdentifier, ServiceSpaceMember>;

export type MemberToContainer = Record<UniqueIdentifier, string>;
