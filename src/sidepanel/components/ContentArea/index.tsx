import { useCallback, useRef } from "react";
import { Spin } from "antd";
import { useBookmarkContext } from "@/sidepanel/context/BookmarkContext";
import { useViewSettings } from "@/sidepanel/context/ViewSettingsContext";
import SortableItem from "./SortableItem";
import ListSortableItem from "./ListSortableItem";
import DragContext from "./DragContext";
import { useRubberBand } from "./useRubberBand";
import styles from "./ContentArea.module.css";

interface ContentAreaProps {
  renamingFolderId?: string | null;
  onRenameSubmit?: (newTitle: string) => void;
  onRenameCancel?: () => void;
}

export default function ContentArea({
  renamingFolderId,
  onRenameSubmit,
  onRenameCancel,
}: ContentAreaProps) {
  const {
    loading,
    currentItems,
    selectedIds,
    toggleSelect,
    clearSelection,
    navigateTo,
    setSelectedIds,
    selectAll,
  } = useBookmarkContext();
  const { viewMode } = useViewSettings();

  const containerRef = useRef<HTMLDivElement>(null);

  // 框选回调
  const handleRubberBandSelection = useCallback(
    (ids: Set<string>) => {
      if (ids.size === 0) {
        clearSelection();
      } else {
        setSelectedIds(ids);
      }
    },
    [clearSelection, setSelectedIds],
  );

  const { rect, handlers } = useRubberBand({
    containerRef,
    onSelectionChange: handleRubberBandSelection,
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin />
      </div>
    );
  }

  const allSelected =
    currentItems.length > 0 &&
    currentItems.every((item) => selectedIds.has(item.id));

  if (currentItems.length === 0) {
    return <div className={styles.empty}>此文件夹为空</div>;
  }

  function handleDoubleClick(item: (typeof currentItems)[number]) {
    if (item.type === "folder") {
      navigateTo(item.id);
    } else if (item.url) {
      window.open(item.url, "_blank");
    }
  }

  return (
    <div ref={containerRef} className={styles.contentArea} {...handlers}>
      <DragContext viewMode={viewMode}>
        {viewMode === "list" ? (
          <div className={styles.listContainer}>
            <div className={styles.listHeader}>
              <div className={styles.listHeaderCheckbox}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => {
                    if (allSelected) {
                      clearSelection();
                    } else {
                      selectAll();
                    }
                  }}
                />
              </div>
              <div className={styles.listHeaderName}>名称</div>
              <div className={styles.listHeaderUrl}>URL</div>
              <div className={styles.listHeaderDate}>添加日期</div>
            </div>
            {currentItems.map((item) => (
              <ListSortableItem
                key={item.id}
                item={item}
                selected={selectedIds.has(item.id)}
                onSelect={(multi, range) => toggleSelect(item.id, multi, range)}
                onDoubleClick={() => handleDoubleClick(item)}
                renaming={renamingFolderId === item.id}
                onRenameSubmit={onRenameSubmit}
                onRenameCancel={onRenameCancel}
              />
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {currentItems.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                selected={selectedIds.has(item.id)}
                onSelect={(multi, range) => toggleSelect(item.id, multi, range)}
                onDoubleClick={() => handleDoubleClick(item)}
                renaming={renamingFolderId === item.id}
                onRenameSubmit={onRenameSubmit}
                onRenameCancel={onRenameCancel}
              />
            ))}
          </div>
        )}
      </DragContext>
      {/* 框选矩形 */}
      {rect && (
        <div
          className={styles.rubberBand}
          style={{
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          }}
        />
      )}
    </div>
  );
}
