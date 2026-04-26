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
} from "@dnd-kit/sortable";
import { useBookmarkContext } from "@/sidepanel/context/BookmarkContext";
import SortableItem from "./SortableItem";
import styles from "./ContentArea.module.css";

interface DragContextProps {
  children: ReactNode;
  renamingFolderId?: string | null;
  onRenameSubmit?: (newTitle: string) => void;
  onRenameCancel?: () => void;
}

// 拖拽数据
export interface DragItemData {
  id: string;
  type: "bookmark" | "folder";
  title: string;
}

export default function DragContext({
  children,
  renamingFolderId,
  onRenameSubmit,
  onRenameCancel,
}: DragContextProps) {
  const {
    currentItems,
    selectedIds,
    toggleSelect,
    clearSelection,
    navigateTo,
    moveItems,
    setSelectedIds,
  } = useBookmarkContext();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeData, setActiveData] = useState<DragItemData | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

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
      });

      // 如果拖拽的项目不在已选中列表中，清除其他选中并选中当前
      if (!selectedIds.has(id)) {
        setSelectedIds(new Set([id]));
      }
    },
    [currentItems, selectedIds, setSelectedIds],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event;
      if (!over) {
        setDropTargetId(null);
        return;
      }
      const overId = over.id as string;
      const overItem = currentItems.find((i) => i.id === overId);
      // 只在文件夹上高亮
      if (overItem?.type === "folder") {
        setDropTargetId(overId);
      } else {
        setDropTargetId(null);
      }
    },
    [currentItems],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setActiveData(null);
      setDropTargetId(null);

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
        // 移动到目标文件夹
        moveItems(idsToMove, overId);
      } else {
        // 移动到同一位置（重新排序）
        const targetIndex = currentItems.findIndex((i) => i.id === overId);
        if (targetIndex !== -1) {
          moveItems(idsToMove, overItem.parentId!, targetIndex);
        }
      }
    },
    [currentItems, selectedIds, moveItems],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setActiveData(null);
    setDropTargetId(null);
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
      <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
        {children}
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {activeId && activeData ? (
          <div className={styles.dragOverlay}>
            <div className={styles.dragOverlayContent}>
              {selectedIds.size > 1
                ? `${selectedIds.size} 个项目`
                : activeData.title}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
