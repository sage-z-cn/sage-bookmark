import { useCallback } from "react";
import { Button, message } from "antd";
import { DownloadOutlined, CloseOutlined } from "@ant-design/icons";
import { useDroppable } from "@dnd-kit/core";
import DockItemComponent from "./DockItem";
import type { DockItem } from "@/sidepanel/hooks/useDock";
import { DOCK_DROPPABLE_ID } from "@/sidepanel/context/GlobalDndContext";
import styles from "./DockBar.module.css";

interface DockBarProps {
  items: DockItem[];
  isDragging: boolean;
  onRemoveItem: (id: string) => void;
  onPlaceAll: () => Promise<void>;
  onCancelAll: () => Promise<void>;
  canPlace: boolean;
}

export default function DockBar({
  items,
  isDragging,
  onRemoveItem,
  onPlaceAll,
  onCancelAll,
  canPlace,
}: DockBarProps) {
  // 设置 Dock 栏为可放置区域
  const { setNodeRef, isOver } = useDroppable({
    id: DOCK_DROPPABLE_ID,
  });

  const isVisible = isDragging || items.length > 0;
  const isDropTarget = isOver && isDragging;

  const handlePlaceAll = useCallback(async () => {
    try {
      await onPlaceAll();
      message.success(`已将 ${items.length} 个项目移动到当前目录`);
    } catch (e) {
      message.error("放置失败");
      console.error(e);
    }
  }, [onPlaceAll, items.length]);

  const handleCancelAll = useCallback(async () => {
    try {
      await onCancelAll();
    } catch (e) {
      message.error("取消失败");
      console.error(e);
    }
  }, [onCancelAll, items.length]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      className={`${styles.dockBar} ${isVisible ? styles.dockBarVisible : ""} ${isDropTarget ? styles.dockBarDropActive : ""}`}
    >
      {items.length === 0 && isDragging ? (
        <div className={styles.dropHint}>拖放到此处暂存</div>
      ) : (
        <>
          <div className={styles.itemsContainer}>
            {items.map((item) => (
              <DockItemComponent
                key={item.id}
                item={item}
                onRemove={onRemoveItem}
              />
            ))}
          </div>
          <div className={styles.buttonGroup}>
            <Button
              type="primary"
              size="small"
              className={styles.actionButton}
              icon={<DownloadOutlined />}
              onClick={handlePlaceAll}
              disabled={!canPlace}
            >
              放置
            </Button>
            <Button
              type="default"
              size="small"
              className={styles.actionButton}
              icon={<CloseOutlined />}
              onClick={handleCancelAll}
            >
              取消
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
