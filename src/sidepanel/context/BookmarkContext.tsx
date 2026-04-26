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
  PathSegment,
} from "@/types/bookmark";
import { bookmarkService } from "@/sidepanel/services/bookmarkService";

interface BookmarkContextValue {
  index: BookmarkIndex | null;
  loading: boolean;
  currentNodeId: string;
  currentItems: AppBookmarkNode[];
  currentPath: PathSegment[];
  selectedIds: Set<string>;
  navigateTo: (folderId: string) => void;
  goBack: () => void;
  goForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  refresh: () => void;
  toggleSelect: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  selectAll: () => void;
  // CRUD 操作
  createBookmark: (title: string, url: string) => Promise<void>;
  createFolder: (title: string) => Promise<void>;
  updateBookmark: (id: string, title: string, url: string) => Promise<void>;
  renameItem: (id: string, newTitle: string) => Promise<void>;
  deleteSelected: () => Promise<void>;
}

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

export function useBookmarkContext() {
  const ctx = useContext(BookmarkContext);
  if (!ctx)
    throw new Error("useBookmarkContext must be used within BookmarkProvider");
  return ctx;
}

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = useState<BookmarkIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentNodeId, setCurrentNodeId] = useState("1");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const historyRef = useRef<string[]>(["1"]);
  const historyIdxRef = useRef(0);

  const loadTree = useCallback(async () => {
    setLoading(true);
    try {
      const idx = await bookmarkService.getTree();
      setIndex(idx);
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
    } finally {
      setLoading(false);
    }
  }, []);

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

  const navigateTo = useCallback((folderId: string) => {
    setCurrentNodeId(folderId);
    setSelectedIds(new Set());
    const history = historyRef.current;
    const idx = historyIdxRef.current;
    historyRef.current = [...history.slice(0, idx + 1), folderId];
    historyIdxRef.current = historyRef.current.length - 1;
  }, []);

  const canGoBack = historyIdxRef.current > 0;
  const canGoForward = historyIdxRef.current < historyRef.current.length - 1;

  const goBack = useCallback(() => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current -= 1;
    const prevId = historyRef.current[historyIdxRef.current];
    setCurrentNodeId(prevId);
    setSelectedIds(new Set());
  }, []);

  const goForward = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current += 1;
    const nextId = historyRef.current[historyIdxRef.current];
    setCurrentNodeId(nextId);
    setSelectedIds(new Set());
  }, []);

  const refresh = useCallback(() => {
    loadTree();
  }, [loadTree]);

  const toggleSelect = useCallback((id: string, multi = false) => {
    setSelectedIds((prev) => {
      const next = new Set(multi ? prev : []);
      if (multi && prev.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
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
  }, [index, selectedIds]);

  const value = useMemo<BookmarkContextValue>(
    () => ({
      index,
      loading,
      currentNodeId,
      currentItems,
      currentPath,
      selectedIds,
      navigateTo,
      goBack,
      goForward,
      canGoBack,
      canGoForward,
      refresh,
      toggleSelect,
      clearSelection,
      selectAll,
      createBookmark,
      createFolder,
      updateBookmark,
      renameItem,
      deleteSelected,
    }),
    [
      index,
      loading,
      currentNodeId,
      currentItems,
      currentPath,
      selectedIds,
      navigateTo,
      goBack,
      goForward,
      canGoBack,
      canGoForward,
      refresh,
      toggleSelect,
      clearSelection,
      selectAll,
      createBookmark,
      createFolder,
      updateBookmark,
      renameItem,
      deleteSelected,
    ],
  );

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
}
