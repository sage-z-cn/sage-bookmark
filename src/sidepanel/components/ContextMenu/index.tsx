import { useCallback, useEffect, useRef, useState } from "react";
import { useBookmarkContext } from "@/sidepanel/context/BookmarkContext";
import type { AppBookmarkNode } from "@/types/bookmark";
import styles from "./ContextMenu.module.css";

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  targetItem: AppBookmarkNode | null;
}

interface ContextMenuProps {
  onEdit: (item: AppBookmarkNode) => void;
  onDelete: () => void;
}

export default function ContextMenu({ onEdit, onDelete }: ContextMenuProps) {
  const ctx = useBookmarkContext();
  const { selectedIds, index, toggleSelect, cut, copy, paste, canPaste } = ctx;
  const [state, setState] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    targetItem: null,
  });
  const menuRef = useRef<HTMLDivElement>(null);

  // 右键事件监听
  useEffect(() => {
    function handleContextMenu(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("[data-item-id]");
      if (!target) return;

      e.preventDefault();
      const itemId = (target as HTMLElement).dataset.itemId!;
      const item = index?.nodeMap.get(itemId);
      if (!item) return;

      // 如果右键的项目未被选中，则选中它
      if (!selectedIds.has(itemId)) {
        toggleSelect(itemId, false, false);
      }

      // 计算菜单位置，确保不超出视口
      const x = Math.min(e.clientX, window.innerWidth - 200);
      const y = Math.min(e.clientY, window.innerHeight - 300);

      setState({ visible: true, x, y, targetItem: item });
    }

    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [index, selectedIds, toggleSelect]);

  // 点击其他地方关闭菜单
  useEffect(() => {
    if (!state.visible) return;

    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setState((prev) => ({ ...prev, visible: false }));
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setState((prev) => ({ ...prev, visible: false }));
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [state.visible]);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  if (!state.visible) return null;

  const item = state.targetItem;
  const isFolder = item?.type === "folder";
  const isBookmark = item?.type === "bookmark";
  const hasSelection = selectedIds.size > 0;

  return (
    <div
      ref={menuRef}
      className={styles.menu}
      style={{ left: state.x, top: state.y }}
    >
      {/* 书签：打开链接 */}
      {isBookmark && item?.url && (
        <>
          <button
            className={styles.menuItem}
            onClick={() => {
              window.open(item.url, "_blank");
              close();
            }}
          >
            打开链接
          </button>
          <button
            className={styles.menuItem}
            onClick={() => {
              window.open(item.url, "_blank");
              close();
            }}
          >
            在新标签页中打开
          </button>
          <div className={styles.divider} />
        </>
      )}

      {/* 文件夹：打开 */}
      {isFolder && (
        <>
          <button
            className={styles.menuItem}
            onClick={() => {
              ctx.navigateTo(item!.id);
              close();
            }}
          >
            打开文件夹
          </button>
          <div className={styles.divider} />
        </>
      )}

      {/* 剪切/复制/粘贴 */}
      <button
        className={styles.menuItem}
        disabled={!hasSelection}
        onClick={() => {
          cut();
          close();
        }}
      >
        剪切
        <span className={styles.shortcut}>Ctrl+X</span>
      </button>
      <button
        className={styles.menuItem}
        disabled={!hasSelection}
        onClick={() => {
          copy();
          close();
        }}
      >
        复制
        <span className={styles.shortcut}>Ctrl+C</span>
      </button>
      <button
        className={styles.menuItem}
        disabled={!canPaste}
        onClick={() => {
          paste();
          close();
        }}
      >
        粘贴
        <span className={styles.shortcut}>Ctrl+V</span>
      </button>

      <div className={styles.divider} />

      {/* 编辑 */}
      {item && (
        <button
          className={styles.menuItem}
          onClick={() => {
            onEdit(item);
            close();
          }}
        >
          {isFolder ? "重命名" : "编辑"}
          <span className={styles.shortcut}>F2</span>
        </button>
      )}

      {/* 删除 */}
      <button
        className={`${styles.menuItem} ${styles.danger}`}
        disabled={!hasSelection}
        onClick={() => {
          onDelete();
          close();
        }}
      >
        删除
        <span className={styles.shortcut}>Del</span>
      </button>
    </div>
  );
}
