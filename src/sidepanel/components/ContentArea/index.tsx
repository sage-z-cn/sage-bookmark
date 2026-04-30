import { useEffect, useRef } from "react";
import { Spin } from "antd";
import { useBookmarkContext } from "@/sidepanel/context/BookmarkContext";
import { useViewSettings } from "@/sidepanel/context/ViewSettingsContext";
import type { SearchResult } from "@/sidepanel/hooks/useSearch";
import SortableItem from "./SortableItem";
import ListSortableItem from "./ListSortableItem";
import DragContext from "./DragContext";
import { useRubberBand } from "./useRubberBand";
import styles from "./ContentArea.module.css";

interface ContentAreaProps {
  renamingFolderId?: string | null;
  onRenameSubmit?: (newTitle: string) => void;
  onRenameCancel?: () => void;
  searchResults?: SearchResult[];
  searchQuery?: string;
  searchActive?: boolean;
  dockedIds?: Set<string>;
}

export default function ContentArea({
  renamingFolderId,
  onRenameSubmit,
  onRenameCancel,
  searchResults,
  searchQuery,
  searchActive = false,
  dockedIds,
}: ContentAreaProps) {
  const {
    loading,
    currentItems,
    currentNodeId,
    selectedIds,
    toggleSelect,
    clearSelection,
    navigateTo,
    setSelectedIds,
    selectAll,
    clipboard,
    clearClipboard,
  } = useBookmarkContext();
  const { viewMode } = useViewSettings();

  const containerRef = useRef<HTMLDivElement>(null);

  // 框选回调
  const handleRubberBandSelection = (ids: Set<string>) => {
    if (ids.size === 0) {
      clearSelection();
    } else {
      setSelectedIds(ids);
    }
  };

  const { rect, handlers } = useRubberBand({
    containerRef,
    onSelectionChange: handleRubberBandSelection,
  });

  // 判断是否处于搜索模式
  const isSearchMode = searchActive && searchResults !== undefined;
  const displayItems = isSearchMode
    ? searchResults.map((r) => r.item)
    : currentItems;

  // 判断当前项是否被剪切（同目录下才显示虚化）
  const cutIds =
    clipboard?.action === "cut" && clipboard.sourceParentId === currentNodeId
      ? new Set(clipboard.ids)
      : new Set<string>();

  // 按 Esc 取消剪切状态
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && clipboard?.action === "cut") {
        clearClipboard();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clipboard, clearClipboard]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin />
      </div>
    );
  }

  const allSelected =
    displayItems.length > 0 &&
    displayItems.every((item) => selectedIds.has(item.id));

  if (displayItems.length === 0) {
    return (
      <div className={styles.empty}>
        {isSearchMode ? "未找到匹配的书签" : "此文件夹为空"}
      </div>
    );
  }

  function handleDoubleClick(item: (typeof displayItems)[number]) {
    if (item.type === "folder") {
      navigateTo(item.id);
    } else if (item.url) {
      window.open(item.url, "_blank");
    }
  }

  return (
    <div
      ref={containerRef}
      className={styles.contentArea}
      data-content-area
      {...handlers}
    >
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
            {displayItems.map((item) => (
              <ListSortableItem
                key={item.id}
                item={item}
                selected={selectedIds.has(item.id)}
                selectedIds={selectedIds}
                cut={cutIds.has(item.id)}
                docked={dockedIds?.has(item.id)}
                onSelect={(multi, range) => toggleSelect(item.id, multi, range)}
                onDoubleClick={() => handleDoubleClick(item)}
                renaming={renamingFolderId === item.id}
                onRenameSubmit={onRenameSubmit}
                onRenameCancel={onRenameCancel}
                highlightQuery={searchQuery}
              />
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {displayItems.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                selected={selectedIds.has(item.id)}
                selectedIds={selectedIds}
                cut={cutIds.has(item.id)}
                docked={dockedIds?.has(item.id)}
                onSelect={(multi, range) => toggleSelect(item.id, multi, range)}
                onDoubleClick={() => handleDoubleClick(item)}
                renaming={renamingFolderId === item.id}
                onRenameSubmit={onRenameSubmit}
                onRenameCancel={onRenameCancel}
                highlightQuery={searchQuery}
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
