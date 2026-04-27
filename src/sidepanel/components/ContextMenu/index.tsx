import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useBookmarkContext } from "@/sidepanel/context/BookmarkContext";
import type { AppBookmarkNode } from "@/types/bookmark";
import styles from "./ContextMenu.module.css";

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  targetItem: AppBookmarkNode | null;
  isBackground: boolean;
}

interface ContextMenuProps {
  onEdit: (item: AppBookmarkNode) => void;
  onDelete: () => void;
  onCreateBookmark?: () => void;
  onCreateFolder?: () => void;
  onRefresh?: () => void;
}

export default function ContextMenu({
  onEdit,
  onDelete,
  onCreateBookmark,
  onCreateFolder,
  onRefresh,
}: ContextMenuProps) {
  const ctx = useBookmarkContext();
  const { selectedIds, index, toggleSelect, cut, copy, paste, canPaste } = ctx;
  const [state, setState] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    targetItem: null,
    isBackground: false,
  });
  const [position, setPosition] = useState({ x: -9999, y: -9999 });
  const [positioned, setPositioned] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 计算菜单位置（渲染后根据实际尺寸调整）
  useLayoutEffect(() => {
    if (!state.visible || !menuRef.current) return;

    const menu = menuRef.current;
    const menuRect = menu.getBoundingClientRect();
    const menuWidth = menuRect.width;
    const menuHeight = menuRect.height;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = state.x;
    let y = state.y;

    // 水平定位：优先在鼠标右侧，空间不足则在左侧
    if (x + menuWidth > viewportWidth) {
      x = Math.max(0, x - menuWidth);
    }

    // 垂直定位：优先在鼠标下方，空间不足则在上方
    if (y + menuHeight > viewportHeight) {
      y = Math.max(0, viewportHeight - menuHeight);
    }

    setPosition({ x, y });
    setPositioned(true);
  }, [state]);

  // 重置定位状态
  useEffect(() => {
    if (!state.visible) {
      setPosition({ x: -9999, y: -9999 });
      setPositioned(false);
    }
  }, [state.visible]);

  // 右键事件监听（项目上右键）
  useEffect(() => {
    function handleContextMenu(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("[data-item-id]");
      if (!target) return;

      e.preventDefault();
      const itemId = (target as HTMLElement).dataset.itemId!;
      const item = index?.nodeMap.get(itemId);
      if (!item) return;

      if (!selectedIds.has(itemId)) {
        toggleSelect(itemId, false, false);
      }

      setState({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        targetItem: item,
        isBackground: false,
      });
    }

    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [index, selectedIds, toggleSelect]);

  // 空白处右键事件监听
  useEffect(() => {
    function handleBackgroundContextMenu(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("[data-item-id]");
      if (target) return;

      const contentArea = (e.target as HTMLElement).closest(
        "[data-content-area]",
      );
      if (!contentArea) return;

      e.preventDefault();

      setState({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        targetItem: null,
        isBackground: true,
      });
    }

    document.addEventListener("contextmenu", handleBackgroundContextMenu);
    return () =>
      document.removeEventListener("contextmenu", handleBackgroundContextMenu);
  }, []);

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

  // 空白处右键菜单
  if (state.isBackground) {
    return (
      <div
        ref={menuRef}
        className={styles.menu}
        style={{ left: position.x, top: position.y, visibility: positioned ? 'visible' : 'hidden' }}
      >
        {canPaste && (
          <>
            <button
              className={styles.menuItem}
              onClick={() => {
                paste();
                close();
              }}
            >
              粘贴
              <span className={styles.shortcut}>Ctrl+V</span>
            </button>
            <div className={styles.divider} />
          </>
        )}

        {onCreateBookmark && (
          <button
            className={styles.menuItem}
            onClick={() => {
              onCreateBookmark();
              close();
            }}
          >
            新建书签
          </button>
        )}
        {onCreateFolder && (
          <button
            className={styles.menuItem}
            onClick={() => {
              onCreateFolder();
              close();
            }}
          >
            新建文件夹
          </button>
        )}

        {onRefresh && (
          <>
            <div className={styles.divider} />
            <button
              className={styles.menuItem}
              onClick={() => {
                onRefresh();
                close();
              }}
            >
              刷新
            </button>
          </>
        )}
      </div>
    );
  }

  // 项目右键菜单
  return (
    <div
      ref={menuRef}
      className={styles.menu}
      style={{ left: position.x, top: position.y, visibility: positioned ? 'visible' : 'hidden' }}
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
