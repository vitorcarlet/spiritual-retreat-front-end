import { Active, Over, UniqueIdentifier } from "@dnd-kit/core";
import { Items } from "./types";
import { arrayMove } from "@dnd-kit/sortable";
import { unstable_batchedUpdates } from "react-dom";

export const TRASH_ID = "void";
export const PLACEHOLDER_ID = "placeholder";

// NOVOS TIPOS / AJUSTES PARA O(1)
export interface MembersMapEntry {
  id: UniqueIdentifier;
  name: string;
}
export type MembersById = Record<UniqueIdentifier, MembersMapEntry>;
export type MemberToContainer = Record<UniqueIdentifier, UniqueIdentifier>;

// Assinaturas agora aceitam mapas para atualizar em O(1)
interface onDragOverProps {
  active: Active;
  over: Over | null;
  items: Items;
  setItems: React.Dispatch<React.SetStateAction<Items>>;
  recentlyMovedToNewContainer: React.RefObject<boolean>;
  memberToContainer: MemberToContainer;
  setMemberToContainer: React.Dispatch<React.SetStateAction<MemberToContainer>>;
}

type onDragEndProps = Omit<onDragOverProps, "recentlyMovedToNewContainer"> & {
  setActiveId: React.Dispatch<React.SetStateAction<UniqueIdentifier | null>>;
  setContainers: React.Dispatch<React.SetStateAction<UniqueIdentifier[]>>;
  getNextContainerId: () => UniqueIdentifier;
  activeId: UniqueIdentifier | null;
};

export function onDragOver({
  active,
  over,
  items,
  setItems,
  recentlyMovedToNewContainer,
  memberToContainer,
  setMemberToContainer,
}: onDragOverProps) {
  const overId = over?.id;

  if (overId == null || overId === TRASH_ID || active.id in items) {
    return;
  }

  const overContainer = findContainer(overId, items, memberToContainer);
  const activeContainer = findContainer(active.id, items, memberToContainer);

  if (!overContainer || !activeContainer || activeContainer === overContainer) {
    return;
  }

  setItems((prev) => {
    const activeList = prev[activeContainer];
    const overList = prev[overContainer];
    const activeIndex = activeList.indexOf(active.id);
    const overIndex = overList.indexOf(overId);
    let newIndex: number;

    if (overId in prev) {
      newIndex = overList.length + 1;
    } else {
      const isBelowOverItem =
        over &&
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;
      const modifier = isBelowOverItem ? 1 : 0;
      newIndex = overIndex >= 0 ? overIndex + modifier : overList.length + 1;
    }

    const movingId = activeList[activeIndex];
    const next: Items = {
      ...prev,
      [activeContainer]: activeList.filter((id) => id !== movingId),
      [overContainer]: [
        ...overList.slice(0, newIndex),
        movingId,
        ...overList.slice(newIndex),
      ],
    };
    recentlyMovedToNewContainer.current = true;
    // Atualiza mapa O(1)
    setMemberToContainer((m) => ({ ...m, [movingId]: overContainer }));
    return next;
  });
}

export function onDragEnd({
  active,
  over,
  items,
  activeId,
  setItems,
  setActiveId,
  setContainers,
  getNextContainerId,
  memberToContainer,
  setMemberToContainer,
}: onDragEndProps) {
  if (active.id in items && over?.id) {
    setContainers((containers) => {
      const activeIndex = containers.indexOf(active.id);
      const overIndex = containers.indexOf(over.id);
      return arrayMove(containers, activeIndex, overIndex);
    });
  }

  const activeContainer = findContainer(active.id, items, memberToContainer);
  if (!activeContainer) {
    setActiveId(null);
    return;
  }

  const overId = over?.id;
  if (overId == null) {
    setActiveId(null);
    return;
  }

  if (overId === TRASH_ID) {
    setItems((prev) => ({
      ...prev,
      [activeContainer]: prev[activeContainer].filter((id) => id !== activeId),
    }));
    if (activeId) {
      setMemberToContainer((m) => {
        const clone = { ...m };
        delete clone[activeId];
        return clone;
      });
    }
    setActiveId(null);
    return;
  }

  if (overId === PLACEHOLDER_ID) {
    const newContainerId = getNextContainerId();
    unstable_batchedUpdates(() => {
      setContainers((c) => [...c, newContainerId]);
      setItems((prev) => {
        const activeList = prev[activeContainer];
        const idx = activeList.findIndex((id) => id === active.id);
        const movingId = activeList[idx];
        return {
          ...prev,
          [activeContainer]: activeList.filter((id) => id !== movingId),
          [newContainerId]: movingId ? [movingId] : [],
        };
      });
      setMemberToContainer((m) =>
        active.id ? { ...m, [active.id]: newContainerId } : m
      );
      setActiveId(null);
    });
    return;
  }

  const overContainer = findContainer(overId, items, memberToContainer);
  if (overContainer) {
    const activeIndex = items[activeContainer].indexOf(active.id);
    const overIndex = items[overContainer].indexOf(overId);
    if (activeIndex !== overIndex || activeContainer !== overContainer) {
      setItems((prev) => ({
        ...prev,
        [overContainer]: arrayMove(
          prev[overContainer],
          activeContainer === overContainer
            ? activeIndex
            : prev[overContainer].indexOf(active.id),
          overIndex
        ),
        ...(activeContainer !== overContainer
          ? {
              [activeContainer]: prev[activeContainer].filter(
                (id) => id !== active.id
              ),
            }
          : null),
      }));
      if (activeContainer !== overContainer) {
        setMemberToContainer((m) => ({ ...m, [active.id]: overContainer }));
      }
    }
  }
  setActiveId(null);
}

export const findContainer = (
  id: UniqueIdentifier,
  items: Items,
  memberToContainer?: MemberToContainer
) => {
  if (id in items) return id;
  if (memberToContainer && memberToContainer[id]) return memberToContainer[id];
  return Object.keys(items).find((key) => items[key].includes(id));
};
