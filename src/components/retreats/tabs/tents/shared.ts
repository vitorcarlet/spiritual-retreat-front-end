import { Active, Over, UniqueIdentifier } from "@dnd-kit/core";
import { PLACEHOLDER_ID, TRASH_ID } from "./RetreatTentsTable";
import { Items } from "./types";
import { arrayMove } from "@dnd-kit/sortable";
import { unstable_batchedUpdates } from "react-dom";

interface onDragOverProps {
  active: Active;
  over: Over | null;
  items: Items;
  setItems: React.Dispatch<React.SetStateAction<Items>>;
  recentlyMovedToNewContainer: React.RefObject<boolean>;
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
}: onDragOverProps) {
  const overId = over?.id;

  if (overId == null || overId === TRASH_ID || active.id in items) {
    return;
  }

  const overContainer = findContainer(overId, items);
  const activeContainer = findContainer(active.id, items);

  if (!overContainer || !activeContainer) {
    return;
  }
  //console.log({ overContainer, activeContainer, overId, activeId: active.id });

  if (activeContainer !== overContainer) {
    setItems((items) => {
      const activeItems = items[activeContainer];
      const overItems = items[overContainer];
      const overIndex = overItems.indexOf(overId);
      const activeIndex = activeItems.indexOf(active.id);

      let newIndex: number;

      if (overId in items) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;

        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      recentlyMovedToNewContainer.current = true;

      return {
        ...items,
        [activeContainer]: items[activeContainer].filter(
          (item) => item !== active.id
        ),
        [overContainer]: [
          ...items[overContainer].slice(0, newIndex),
          items[activeContainer][activeIndex],
          ...items[overContainer].slice(newIndex, items[overContainer].length),
        ],
      };
    });
  }
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
}: onDragEndProps) {
  if (active.id in items && over?.id) {
    setContainers((containers) => {
      const activeIndex = containers.indexOf(active.id);
      const overIndex = containers.indexOf(over.id);

      return arrayMove(containers, activeIndex, overIndex);
    });
  }

  const activeContainer = findContainer(active.id, items);

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
    setItems((items) => ({
      ...items,
      [activeContainer]: items[activeContainer].filter((id) => id !== activeId),
    }));
    setActiveId(null);
    return;
  }

  if (overId === PLACEHOLDER_ID) {
    const newContainerId = getNextContainerId();

    unstable_batchedUpdates(() => {
      setContainers((containers) => [...containers, newContainerId]);
      setItems((items) => ({
        ...items,
        [activeContainer]: items[activeContainer].filter(
          (id) => id !== activeId
        ),
        [newContainerId]: [active.id],
      }));
      setActiveId(null);
    });
    return;
  }

  const overContainer = findContainer(overId, items);

  if (overContainer) {
    const activeIndex = items[activeContainer].indexOf(active.id);
    const overIndex = items[overContainer].indexOf(overId);

    if (activeIndex !== overIndex) {
      setItems((items) => ({
        ...items,
        [overContainer]: arrayMove(
          items[overContainer],
          activeIndex,
          overIndex
        ),
      }));
    }
  }

  setActiveId(null);
}

export const findContainer = (id: UniqueIdentifier, items: Items) => {
  if (id in items) {
    return id;
  }

  return Object.keys(items).find((key) => items[key].includes(id));
};
