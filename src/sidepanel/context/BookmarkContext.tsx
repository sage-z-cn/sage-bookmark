import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  AppBookmarkNode,
  BookmarkIndex,
  ClipboardState,
  PathSegment,
} from "@/types/bookmark";
import { bookmarkService } from "@/sidepanel/services/bookmarkService";
import { useViewSettings } from "@/sidepanel/context/ViewSettingsContext";

interface BookmarkContextValue {
  index: BookmarkIndex | null;
  loading: boolean;
  currentNodeId: string;
  currentItems: AppBookmarkNode[];
  currentPath: PathSegment[];
  selectedIds: Set<string>;
  lastSelectedId: string | null;
  navigateTo: (folderId: string) => void;
  goBack: () => void;
  goForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  refresh: () => void;
  toggleSelect: (id: string, multi?: boolean, range?: boolean) => void;
  rangeSelect: (fromId: string, toId: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  // CRUD 操作
  createBookmark: (title: string, url: string) => Promise<void>;
  createFolder: (title: string) => Promise<void>;
  createFolderIn: (parentId: string, title: string) => Promise<void>;
  updateBookmark: (id: string, title: string, url: string) => Promise<void>;
  renameItem: (id: string, newTitle: string) => Promise<void>;
  deleteSelected: () => Promise<void>;
  // 剪贴板
  clipboard: ClipboardState | null;
  cut: () => void;
  copy: () => void;
  paste: () => Promise<void>;
  clearClipboard: () => void;
  canPaste: boolean;
  // 移动
  moveItems: (
    ids: string[],
    targetFolderId: string,
    targetIndex?: number,
  ) => Promise<void>;
  // 乐观更新：同目录内重排
  optimisticReorder: (activeId: string, overId: string) => void;
  // 乐观更新：移入目标文件夹
  optimisticMoveIntoFolder: (ids: string[], targetFolderId: string) => void;
  // 导出导入
  exportAsJson: (folderId: string) => Promise<void>;
  importFromJson: (file: File, targetParentId: string) => Promise<void>;
}

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

export function useBookmarkContext() {
  const ctx = useContext(BookmarkContext);
  if (!ctx)
    throw new Error("useBookmarkContext must be used within BookmarkProvider");
  return ctx;
}

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const { persistedFolderId, setPersistedFolderId } = useViewSettings();
  const [index, setIndex] = useState<BookmarkIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentNodeId, setCurrentNodeId] = useState("1");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<ClipboardState | null>(null);

  const historyRef = useRef<string[]>(["1"]);
  const historyIdxRef = useRef(0);

  const initializedRef = useRef(false);

  const loadTree = useCallback(async () => {
    setLoading(true);
    try {
      const idx = await bookmarkService.getTree();
      setIndex(idx);
      if (!initializedRef.current) {
        initializedRef.current = true;
        // 优先恢复持久化的目录（如果有效且存在）
        if (persistedFolderId && idx.nodeMap.has(persistedFolderId)) {
          setCurrentNodeId(persistedFolderId);
          // 构建从根目录到当前目录的完整路径作为历史记录，支持逐级返回
          const path = bookmarkService.getPathToRoot(
            persistedFolderId,
            idx.nodeMap,
          );
          historyRef.current = path.map((segment) => segment.id);
          historyIdxRef.current = historyRef.current.length - 1;
        } else {
          const bookmarkBarId = "1";
          if (idx.nodeMap.has(bookmarkBarId)) {
            setCurrentNodeId(bookmarkBarId);
          } else if (
            idx.rootNodes.length > 0 &&
            idx.rootNodes[0].children?.length
          ) {
            const firstChild = idx.rootNodes[0].children[0];
            setCurrentNodeId(firstChild.id);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, [persistedFolderId]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  useEffect(() => {
    const cleanup = bookmarkService.onExternalChange(() => {
      loadTree();
    });
    return cleanup;
  }, [loadTree]);

  const currentItems = useMemo<AppBookmarkNode[]>(() => {
    if (!index) return [];
    return index.childrenMap.get(currentNodeId) ?? [];
  }, [index, currentNodeId]);

  const currentPath = useMemo<PathSegment[]>(() => {
    if (!index) return [];
    return bookmarkService.getPathToRoot(currentNodeId, index.nodeMap);
  }, [index, currentNodeId]);

  const navigateTo = useCallback(
    (folderId: string) => {
      setCurrentNodeId(folderId);
      setSelectedIds(new Set());
      setLastSelectedId(null);
      const history = historyRef.current;
      const idx = historyIdxRef.current;
      historyRef.current = [...history.slice(0, idx + 1), folderId];
      historyIdxRef.current = historyRef.current.length - 1;
      // 持久化当前目录
      setPersistedFolderId(folderId);
    },
    [setPersistedFolderId],
  );

  const canGoBack = historyIdxRef.current > 0;
  const canGoForward = historyIdxRef.current < historyRef.current.length - 1;

  const goBack = useCallback(() => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current -= 1;
    const prevId = historyRef.current[historyIdxRef.current];
    setCurrentNodeId(prevId);
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, []);

  const goForward = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current += 1;
    const nextId = historyRef.current[historyIdxRef.current];
    setCurrentNodeId(nextId);
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, []);

  const refresh = useCallback(() => {
    loadTree();
  }, [loadTree]);

  // Shift+Click 范围选择：选中 fromId 到 toId 之间的所有项
  const rangeSelect = useCallback(
    (fromId: string, toId: string) => {
      if (!currentItems.length) return;
      const ids = currentItems.map((item) => item.id);
      const fromIdx = ids.indexOf(fromId);
      const toIdx = ids.indexOf(toId);
      if (fromIdx === -1 || toIdx === -1) return;
      const start = Math.min(fromIdx, toIdx);
      const end = Math.max(fromIdx, toIdx);
      const rangeIds = ids.slice(start, end + 1);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const id of rangeIds) {
          next.add(id);
        }
        return next;
      });
    },
    [currentItems],
  );

  const toggleSelect = useCallback(
    (id: string, multi = false, range = false) => {
      setSelectedIds((prev) => {
        if (range && lastSelectedId) {
          // Shift+Click：范围选择，保留已有选中
          const next = new Set(multi ? prev : []);
          const ids = currentItems.map((item) => item.id);
          const fromIdx = ids.indexOf(lastSelectedId);
          const toIdx = ids.indexOf(id);
          if (fromIdx !== -1 && toIdx !== -1) {
            const start = Math.min(fromIdx, toIdx);
            const end = Math.max(fromIdx, toIdx);
            for (let i = start; i <= end; i++) {
              next.add(ids[i]);
            }
          }
          return next;
        }
        const next = new Set(multi ? prev : []);
        if (multi && prev.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
      setLastSelectedId(id);
    },
    [lastSelectedId, currentItems],
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(currentItems.map((item) => item.id)));
  }, [currentItems]);

  // CRUD：新建书签
  const createBookmark = useCallback(
    async (title: string, url: string) => {
      await bookmarkService.createBookmark(currentNodeId, title, url);
    },
    [currentNodeId],
  );

  // CRUD：新建文件夹
  const createFolder = useCallback(
    async (title: string) => {
      await bookmarkService.createFolder(currentNodeId, title);
    },
    [currentNodeId],
  );

  // CRUD：在指定文件夹下新建子文件夹
  const createFolderIn = useCallback(
    async (parentId: string, title: string) => {
      await bookmarkService.createFolder(parentId, title);
    },
    [],
  );

  // CRUD：编辑书签（标题 + URL）
  const updateBookmark = useCallback(
    async (id: string, title: string, url: string) => {
      await bookmarkService.updateBookmark(id, title, url);
    },
    [],
  );

  // CRUD：重命名（文件夹/书签通用）
  const renameItem = useCallback(async (id: string, newTitle: string) => {
    await bookmarkService.rename(id, newTitle);
  }, []);

  // CRUD：删除选中项
  const deleteSelected = useCallback(async () => {
    if (!index || selectedIds.size === 0) return;
    await bookmarkService.deleteItems([...selectedIds], index.nodeMap);
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, [index, selectedIds]);

  // 剪贴板：剪切
  const cut = useCallback(() => {
    if (selectedIds.size === 0) return;
    setClipboard({
      action: "cut",
      ids: [...selectedIds],
      sourceParentId: currentNodeId,
    });
  }, [selectedIds, currentNodeId]);

  // 剪贴板：复制
  const copy = useCallback(() => {
    if (selectedIds.size === 0) return;
    setClipboard({
      action: "copy",
      ids: [...selectedIds],
      sourceParentId: currentNodeId,
    });
  }, [selectedIds, currentNodeId]);

  // 剪贴板：清空
  const clearClipboard = useCallback(() => {
    setClipboard(null);
  }, []);

  // 剪贴板：粘贴
  const paste = useCallback(async () => {
    if (!clipboard || !index) return;
    const { action, ids } = clipboard;
    if (action === "cut") {
      // 防止移动到自身子目录
      for (const id of ids) {
        const node = index.nodeMap.get(id);
        if (!node) continue;
        if (
          node.type === "folder" &&
          isDescendant(id, currentNodeId, index.nodeMap)
        ) {
          continue;
        }
        await bookmarkService.move(id, currentNodeId);
      }
      setClipboard(null);
    } else {
      // 复制：在当前文件夹下创建副本
      for (const id of ids) {
        await bookmarkService.copyItem(id, currentNodeId, index.nodeMap);
      }
    }
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, [clipboard, index, currentNodeId]);

  // 是否可粘贴：剪贴板非空，且目标不是剪切源的同目录（剪切模式下）
  const canPaste =
    clipboard !== null &&
    !(clipboard.action === "cut" && clipboard.sourceParentId === currentNodeId);

  // 移动项目到目标文件夹
  const moveItems = useCallback(
    async (ids: string[], targetFolderId: string, targetIndex?: number) => {
      if (!index) return;
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const node = index.nodeMap.get(id);
        if (!node) continue;
        // 防止文件夹移动到自身子目录
        if (
          node.type === "folder" &&
          isDescendant(id, targetFolderId, index.nodeMap)
        ) {
          continue;
        }
        await bookmarkService.move(
          id,
          targetFolderId,
          targetIndex != null ? targetIndex + i : undefined,
        );
      }
      setSelectedIds(new Set());
      setLastSelectedId(null);
    },
    [index],
  );

  // 乐观更新：同目录内将 activeId 对应的项移动到 overId 对应项的位置
  const optimisticReorder = useCallback(
    (activeId: string, overId: string) => {
      setIndex((prev) => {
        if (!prev) return prev;
        const children = prev.childrenMap.get(currentNodeId);
        if (!children) return prev;

        const oldIndex = children.findIndex((i) => i.id === activeId);
        const newIndex = children.findIndex((i) => i.id === overId);
        if (oldIndex === -1 || newIndex === -1) return prev;

        const reordered = [...children];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);

        // 同步更新 index 字段
        const updated = reordered.map((item, i) => ({ ...item, index: i }));

        const nextChildrenMap = new Map(prev.childrenMap);
        nextChildrenMap.set(currentNodeId, updated);
        return { ...prev, childrenMap: nextChildrenMap };
      });
    },
    [currentNodeId],
  );

  // 乐观更新：将指定项从当前目录移除（移入文件夹场景）
  const optimisticMoveIntoFolder = useCallback(
    (ids: string[], targetFolderId: string) => {
      setIndex((prev) => {
        if (!prev) return prev;
        const idSet = new Set(ids);

        // 从当前目录移除
        const srcChildren = prev.childrenMap.get(currentNodeId);
        if (!srcChildren) return prev;
        const remaining = srcChildren.filter((i) => !idSet.has(i.id));
        const updatedRemaining = remaining.map((item, i) => ({
          ...item,
          index: i,
        }));

        // 添加到目标文件夹末尾
        const dstChildren = prev.childrenMap.get(targetFolderId) ?? [];
        const movedItems = srcChildren
          .filter((i) => idSet.has(i.id))
          .map((item, i) => ({
            ...item,
            parentId: targetFolderId,
            index: dstChildren.length + i,
          }));
        const updatedDstChildren = [...dstChildren, ...movedItems];

        const nextChildrenMap = new Map(prev.childrenMap);
        nextChildrenMap.set(currentNodeId, updatedRemaining);
        nextChildrenMap.set(targetFolderId, updatedDstChildren);
        return { ...prev, childrenMap: nextChildrenMap };
      });
    },
    [currentNodeId],
  );

  // 导出指定文件夹为 JSON 文件下载
  const exportAsJson = useCallback(async (folderId: string) => {
    const data = await bookmarkService.exportBookmarks(folderId);
    // 清理不需要导出的字段
    const cleaned = cleanExportNode(data);
    const json = JSON.stringify(cleaned, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.title || "bookmarks"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // 从 JSON 文件导入书签到指定文件夹
  const importFromJson = useCallback(
    async (file: File, targetParentId: string) => {
      const text = await file.text();
      const data = JSON.parse(text);
      await bookmarkService.importBookmarks(data, targetParentId);
    },
    [],
  );

  const value = useMemo<BookmarkContextValue>(
    () => ({
      index,
      loading,
      currentNodeId,
      currentItems,
      currentPath,
      selectedIds,
      lastSelectedId,
      navigateTo,
      goBack,
      goForward,
      canGoBack,
      canGoForward,
      refresh,
      toggleSelect,
      rangeSelect,
      clearSelection,
      selectAll,
      setSelectedIds,
      createBookmark,
      createFolder,
      createFolderIn,
      updateBookmark,
      renameItem,
      deleteSelected,
      clipboard,
      cut,
      copy,
      paste,
      clearClipboard,
      canPaste,
      moveItems,
      optimisticReorder,
      optimisticMoveIntoFolder,
      exportAsJson,
      importFromJson,
    }),
    [
      index,
      loading,
      currentNodeId,
      currentItems,
      currentPath,
      selectedIds,
      lastSelectedId,
      navigateTo,
      goBack,
      goForward,
      canGoBack,
      canGoForward,
      refresh,
      toggleSelect,
      rangeSelect,
      clearSelection,
      selectAll,
      setSelectedIds,
      createBookmark,
      createFolder,
      createFolderIn,
      updateBookmark,
      renameItem,
      deleteSelected,
      clipboard,
      cut,
      copy,
      paste,
      clearClipboard,
      canPaste,
      moveItems,
      optimisticReorder,
      optimisticMoveIntoFolder,
      exportAsJson,
      importFromJson,
    ],
  );

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
}

// 检查 targetId 是否是 folderId 的后代（防止循环移动）
function isDescendant(
  folderId: string,
  targetId: string,
  nodeMap: Map<string, AppBookmarkNode>,
): boolean {
  if (folderId === targetId) return true;
  let current = nodeMap.get(targetId);
  while (current?.parentId) {
    if (current.parentId === folderId) return true;
    current = nodeMap.get(current.parentId);
  }
  return false;
}

// 清理导出节点，只保留结构化信息（去除运行时字段如 id、faviconUrl 等）
function cleanExportNode(node: AppBookmarkNode): Record<string, unknown> {
  const result: Record<string, unknown> = {
    title: node.title,
    type: node.type,
  };
  if (node.url) result.url = node.url;
  if (node.type === "folder" && node.children?.length) {
    result.children = node.children.map(cleanExportNode);
  }
  return result;
}
