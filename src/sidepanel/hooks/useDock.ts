import { useCallback, useEffect, useState } from "react";
import type { AppBookmarkNode } from "@/types/bookmark";

export interface DockItem {
  id: string;
  type: "bookmark" | "folder";
  title: string;
  url?: string;
  faviconUrl?: string;
  parentId: string;
}

const STORAGE_KEY = "sage-bookmark-dock-items";
const MAX_DOCK_ITEMS = 50;

export function useDock() {
  const [items, setItems] = useState<DockItem[]>([]);
  const [initialized, setInitialized] = useState(false);

  // 从 chrome.storage.session 恢复暂存数据
  useEffect(() => {
    async function loadFromStorage() {
      try {
        const result = await chrome.storage.session.get(STORAGE_KEY);
        if (result[STORAGE_KEY] && Array.isArray(result[STORAGE_KEY])) {
          setItems(result[STORAGE_KEY]);
        }
      } catch (e) {
        console.error("Failed to load dock items from storage:", e);
      }
      setInitialized(true);
    }
    loadFromStorage();
  }, []);

  // 同步到 chrome.storage.session
  const syncToStorage = useCallback(async (newItems: DockItem[]) => {
    try {
      await chrome.storage.session.set({ [STORAGE_KEY]: newItems });
    } catch (e) {
      console.error("Failed to sync dock items to storage:", e);
    }
  }, []);

  // 添加项目到 Dock 栏
  const addItem = useCallback(
    (node: AppBookmarkNode): boolean => {
      if (items.length >= MAX_DOCK_ITEMS) {
        return false;
      }
      // 去重检查
      if (items.some((item) => item.id === node.id)) {
        return false;
      }
      const dockItem: DockItem = {
        id: node.id,
        type: node.type,
        title: node.title,
        url: node.url,
        faviconUrl: node.faviconUrl,
        parentId: node.parentId || "",
      };
      const newItems = [...items, dockItem];
      setItems(newItems);
      syncToStorage(newItems);
      return true;
    },
    [items, syncToStorage],
  );

  // 批量添加项目
  const addItems = useCallback(
    (nodes: AppBookmarkNode[]): number => {
      const availableSlots = MAX_DOCK_ITEMS - items.length;
      if (availableSlots <= 0) return 0;

      const existingIds = new Set(items.map((item) => item.id));
      const nodesToAdd = nodes
        .filter((node) => !existingIds.has(node.id))
        .slice(0, availableSlots);

      if (nodesToAdd.length === 0) return 0;

      const newDockItems: DockItem[] = nodesToAdd.map((node) => ({
        id: node.id,
        type: node.type,
        title: node.title,
        url: node.url,
        faviconUrl: node.faviconUrl,
        parentId: node.parentId || "",
      }));

      const newItems = [...items, ...newDockItems];
      setItems(newItems);
      syncToStorage(newItems);
      return newDockItems.length;
    },
    [items, syncToStorage],
  );

  // 移除单个项目
  const removeItem = useCallback(
    (id: string) => {
      const newItems = items.filter((item) => item.id !== id);
      setItems(newItems);
      syncToStorage(newItems);
    },
    [items, syncToStorage],
  );

  // 清空所有暂存项目（取消暂存）
  const clearAll = useCallback(async () => {
    setItems([]);
    try {
      await chrome.storage.session.remove(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear dock items from storage:", e);
    }
  }, []);

  // 获取暂存项目的 ID 集合
  const dockedIds = useCallback(() => {
    return new Set(items.map((item) => item.id));
  }, [items]);

  // 检查是否已暂存
  const isDocked = useCallback(
    (id: string) => {
      return items.some((item) => item.id === id);
    },
    [items],
  );

  // 检查指定目录是否是某个暂存文件夹的后代（防止循环移动）
  const isDescendantOfDockedFolder = useCallback(
    (targetFolderId: string, nodeMap: Map<string, AppBookmarkNode>) => {
      for (const item of items) {
        if (item.type !== "folder") continue;
        if (item.id === targetFolderId) return true;
        // 检查 targetFolderId 是否是 item.id 的后代
        let current = nodeMap.get(targetFolderId);
        while (current?.parentId) {
          if (current.parentId === item.id) return true;
          current = nodeMap.get(current.parentId);
        }
      }
      return false;
    },
    [items],
  );

  return {
    items,
    initialized,
    addItem,
    addItems,
    removeItem,
    clearAll,
    dockedIds,
    isDocked,
    isDescendantOfDockedFolder,
    count: items.length,
    isEmpty: items.length === 0,
    isFull: items.length >= MAX_DOCK_ITEMS,
  };
}
