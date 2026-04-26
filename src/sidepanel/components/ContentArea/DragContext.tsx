import { useCallback, useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useBookmarkContext } from "@/sidepanel/context/BookmarkContext";
import { truncateUrl } from "@/sidepanel/utils/format";
import type { ViewMode } from "@/sidepanel/context/ViewSettingsContext";
import styles from "./ContentArea.module.css";

interface DragContextProps {
  children: ReactNode;
  viewMode: ViewMode;
}

// 拖拽数据
export interface DragItemData {
  id: string;
  type: "bookmark" | "folder";
  title: string;
  url?: string;
}

export default function DragContext({ children, viewMode }: DragContextProps) {
  const {
    currentItems,
    selectedIds,
    moveItems,
    optimisticReorder,
    optimisticMoveIntoFolder,
    setSelectedIds,
  } = useBookmarkContext();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeData, setActiveData] = useState<DragItemData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const strategy =
    viewMode === "list" ? verticalListSortingStrategy : rectSortingStrategy;

  const sortableIds = currentItems.map((item) => item.id);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const id = active.id as string;
      const item = currentItems.find((i) => i.id === id);
      if (!item) return;

      setActiveId(id);
      setActiveData({
        id: item.id,
        type: item.type,
        title: item.title,
        url: item.url,
      });

      // 如果拖拽的项目不在已选中列表中，清除其他选中并选中当前
      if (!selectedIds.has(id)) {
        setSelectedIds(new Set([id]));
      }
    },
    [currentItems, selectedIds, setSelectedIds],
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (!over) return;
    // 仅在文件夹上允许拖入悬停
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setActiveData(null);

      if (!over) return;

      const activeItemId = active.id as string;
      const overId = over.id as string;
      const overItem = currentItems.find((i) => i.id === overId);
      if (!overItem) return;

      // 确定要移动的项目：如果拖拽项在选中列表中，移动所有选中项
      const idsToMove = selectedIds.has(activeItemId)
        ? [...selectedIds]
        : [activeItemId];

      if (overItem.type === "folder") {
        optimisticMoveIntoFolder(idsToMove, overId);
        moveItems(idsToMove, overId);
      } else {
        optimisticReorder(activeItemId, overId);
        const targetIndex = currentItems.findIndex((i) => i.id === overId);
        if (targetIndex !== -1) {
          moveItems(idsToMove, overItem.parentId!, targetIndex);
        }
      }
    },
    [
      currentItems,
      selectedIds,
      moveItems,
      optimisticReorder,
      optimisticMoveIntoFolder,
    ],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setActiveData(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortableIds} strategy={strategy}>
        {children}
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {activeId && activeData ? (
          <div className={styles.dragOverlay}>
            <div className={styles.dragOverlayContent}>
              {selectedIds.size > 1
                ? `${selectedIds.size} 个项目`
                : activeData.title ||
                  (activeData.url
                    ? truncateUrl(activeData.url)
                    : "未命名文件夹")}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
