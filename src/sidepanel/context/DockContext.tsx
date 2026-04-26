import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useDock, type DockItem } from "@/sidepanel/hooks/useDock";
import { useBookmarkContext } from "./BookmarkContext";
import { bookmarkService } from "@/sidepanel/services/bookmarkService";
import { message } from "antd";

interface DockContextValue {
  items: DockItem[];
  count: number;
  isEmpty: boolean;
  isFull: boolean;
  initialized: boolean;
  addItem: (id: string) => boolean;
  addItems: (ids: string[]) => number;
  removeItem: (id: string) => void;
  clearAll: () => Promise<void>;
  isDocked: (id: string) => boolean;
  dockedIds: () => Set<string>;
  isDescendantOfDockedFolder: (
    targetFolderId: string,
    nodeMap: Map<string, import("@/types/bookmark").AppBookmarkNode>,
  ) => boolean;
  placeAll: () => Promise<void>;
  canPlace: boolean;
}

const DockContext = createContext<DockContextValue | null>(null);

export function useDockContext() {
  const ctx = useContext(DockContext);
  if (!ctx) {
    throw new Error("useDockContext must be used within DockProvider");
  }
  return ctx;
}

export function DockProvider({ children }: { children: ReactNode }) {
  const dock = useDock();
  const bookmarkCtx = useBookmarkContext();

  // 添加单个项目到 Dock
  const addItem = useCallback(
    (id: string): boolean => {
      const node = bookmarkCtx.index?.nodeMap.get(id);
      if (!node) return false;
      return dock.addItem(node);
    },
    [bookmarkCtx.index, dock],
  );

  // 批量添加项目到 Dock
  const addItems = useCallback(
    (ids: string[]): number => {
      const nodes = ids
        .map((id) => bookmarkCtx.index?.nodeMap.get(id))
        .filter(Boolean) as import("@/types/bookmark").AppBookmarkNode[];
      return dock.addItems(nodes);
    },
    [bookmarkCtx.index, dock],
  );

  // 放置所有暂存项目到当前目录
  const placeAll = useCallback(async () => {
    if (dock.items.length === 0) return;

    const currentFolderId = bookmarkCtx.currentNodeId;
    const nodeMap = bookmarkCtx.index?.nodeMap;
    if (!nodeMap) return;

    // 检查是否会导致循环移动
    if (dock.isDescendantOfDockedFolder(currentFolderId, nodeMap)) {
      message.warning("当前目录是暂存文件夹的子目录，无法移入");
      return;
    }

    // 按顺序移动所有项目
    for (let i = 0; i < dock.items.length; i++) {
      const item = dock.items[i];
      try {
        await bookmarkService.move(item.id, currentFolderId);
      } catch (e) {
        console.error(`Failed to move item ${item.id}:`, e);
      }
    }

    // 清空 Dock
    await dock.clearAll();
    bookmarkCtx.refresh();
  }, [dock, bookmarkCtx]);

  // 检查是否可以放置
  const canPlace = useMemo(() => {
    if (dock.isEmpty) return false;
    const nodeMap = bookmarkCtx.index?.nodeMap;
    if (!nodeMap) return false;
    return !dock.isDescendantOfDockedFolder(
      bookmarkCtx.currentNodeId,
      nodeMap,
    );
  }, [dock, bookmarkCtx.index, bookmarkCtx.currentNodeId]);

  const value = useMemo<DockContextValue>(
    () => ({
      items: dock.items,
      count: dock.count,
      isEmpty: dock.isEmpty,
      isFull: dock.isFull,
      initialized: dock.initialized,
      addItem,
      addItems,
      removeItem: dock.removeItem,
      clearAll: dock.clearAll,
      isDocked: dock.isDocked,
      dockedIds: dock.dockedIds,
      isDescendantOfDockedFolder: dock.isDescendantOfDockedFolder,
      placeAll,
      canPlace,
    }),
    [dock, addItem, placeAll, canPlace],
  );

  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}
