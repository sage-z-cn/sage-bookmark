import { useCallback, useEffect, useRef, useState } from "react";
import { ConfigProvider } from "antd";
import { genesisTheme } from "./styles/token";
import {
  BookmarkProvider,
  useBookmarkContext,
} from "./context/BookmarkContext";
import {
  ViewSettingsProvider,
  useViewSettings,
} from "./context/ViewSettingsContext";
import { DockProvider, useDockContext } from "./context/DockContext";
import { GlobalDndProvider, useGlobalDnd } from "./context/GlobalDndContext";
import AddressBar from "./components/AddressBar";
import Toolbar from "./components/Toolbar";
import SearchBar from "./components/SearchBar";
import ContentArea from "./components/ContentArea";
import StatusBar from "./components/StatusBar";
import DockBar from "./components/DockBar";
import ContextMenu from "./components/ContextMenu";
import CreateBookmarkDialog from "./components/Dialogs/CreateBookmarkDialog";
import CreateFolderDialog from "./components/Dialogs/CreateFolderDialog";
import EditBookmarkDialog from "./components/Dialogs/EditBookmarkDialog";
import ConfirmDeleteDialog from "./components/Dialogs/ConfirmDeleteDialog";
import { useSearch } from "./hooks/useSearch";
import type { AppBookmarkNode } from "@/types/bookmark";

function AppContent() {
  const ctx = useBookmarkContext();
  const dockCtx = useDockContext();
  const globalDnd = useGlobalDnd();
  const { selectedIds, index, currentNodeId } = ctx;

  // 搜索状态
  const [searchBarVisible, setSearchBarVisible] = useState(false);
  const {
    query,
    setQuery,
    isActive: isSearchActive,
    results: searchResults,
    closeSearch,
  } = useSearch({ index, currentNodeId });

  // 对话框状态
  const [createBookmarkOpen, setCreateBookmarkOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [editBookmarkOpen, setEditBookmarkOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);

  // 子文件夹创建目标
  const [subfolderParentId, setSubfolderParentId] = useState<string | null>(
    null,
  );

  // 正在编辑的书签
  const editingBookmarkRef = useRef<AppBookmarkNode | null>(null);

  // 获取唯一选中项
  const singleSelectedItem =
    selectedIds.size === 1 && index
      ? (index.nodeMap.get([...selectedIds][0]) ?? null)
      : null;

  // 处理编辑操作：书签弹 Modal，文件夹行内重命名
  const handleEdit = useCallback(
    (item?: AppBookmarkNode) => {
      const target = item ?? singleSelectedItem;
      if (!target) return;
      if (target.type === "folder") {
        setRenamingFolderId(target.id);
      } else {
        editingBookmarkRef.current = target;
        setEditBookmarkOpen(true);
      }
    },
    [singleSelectedItem],
  );

  // 处理删除操作
  const handleDelete = useCallback(() => {
    if (selectedIds.size > 0) {
      setDeleteConfirmOpen(true);
    }
  }, [selectedIds.size]);

  // 行内重命名提交
  const handleRenameSubmit = useCallback(
    async (newTitle: string) => {
      if (renamingFolderId) {
        await ctx.renameItem(renamingFolderId, newTitle);
        setRenamingFolderId(null);
      }
    },
    [ctx, renamingFolderId],
  );

  // 行内重命名取消
  const handleRenameCancel = useCallback(() => {
    setRenamingFolderId(null);
  }, []);

  // 切换搜索栏
  const handleToggleSearch = useCallback(() => {
    setSearchBarVisible((prev) => {
      if (prev) {
        // 关闭时清空搜索
        closeSearch();
      }
      return !prev;
    });
  }, [closeSearch]);

  // 键盘快捷键
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA";
      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl+F：打开搜索
      if (ctrl && e.key === "f") {
        e.preventDefault();
        setSearchBarVisible(true);
        return;
      }

      // Esc：关闭搜索栏（如果打开）
      if (e.key === "Escape" && searchBarVisible && !isInput) {
        e.preventDefault();
        setSearchBarVisible(false);
        closeSearch();
        return;
      }

      if (isInput) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        ctx.goBack();
      } else if (e.key === "Delete") {
        e.preventDefault();
        handleDelete();
      } else if (e.key === "F2") {
        e.preventDefault();
        handleEdit();
      } else if (ctrl && e.key === "x") {
        e.preventDefault();
        ctx.cut();
      } else if (ctrl && e.key === "c") {
        e.preventDefault();
        ctx.copy();
      } else if (ctrl && e.key === "v") {
        e.preventDefault();
        ctx.paste();
      } else if (ctrl && e.key === "a") {
        e.preventDefault();
        ctx.selectAll();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDelete, handleEdit, ctx, searchBarVisible, closeSearch]);

  // 处理新建子文件夹（从右键菜单触发）
  const handleCreateSubfolder = useCallback((parentId: string) => {
    setSubfolderParentId(parentId);
    setCreateFolderOpen(true);
  }, []);

  // 已暂存项目的 ID 集合
  const dockedIds = new Set(dockCtx.items.map((item) => item.id));

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <AddressBar />
      <Toolbar
        onCreateBookmark={() => setCreateBookmarkOpen(true)}
        onCreateFolder={() => {
          setSubfolderParentId(null);
          setCreateFolderOpen(true);
        }}
        onEdit={() => handleEdit()}
        onDelete={handleDelete}
        searchActive={searchBarVisible}
        onToggleSearch={handleToggleSearch}
      />
      {searchBarVisible && (
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          onClose={() => {
            setSearchBarVisible(false);
            closeSearch();
          }}
        />
      )}
      <ContentArea
        renamingFolderId={renamingFolderId}
        onRenameSubmit={handleRenameSubmit}
        onRenameCancel={handleRenameCancel}
        searchResults={isSearchActive ? searchResults : undefined}
        searchQuery={isSearchActive ? query : undefined}
        searchActive={isSearchActive}
        dockedIds={dockedIds}
      />
      <StatusBar
        searchActive={isSearchActive}
        searchResultCount={searchResults.length}
      />
      <DockBar
        items={dockCtx.items}
        isDragging={globalDnd.isDragging}
        onRemoveItem={dockCtx.removeItem}
        onPlaceAll={dockCtx.placeAll}
        onCancelAll={dockCtx.clearAll}
        canPlace={dockCtx.canPlace}
      />

      {/* 右键上下文菜单 */}
      <ContextMenu
        onEdit={(item) => handleEdit(item)}
        onDelete={handleDelete}
        onCreateSubfolder={handleCreateSubfolder}
      />

      {/* 对话框 */}
      <CreateBookmarkDialog
        open={createBookmarkOpen}
        onClose={() => setCreateBookmarkOpen(false)}
        onConfirm={ctx.createBookmark}
      />
      <CreateFolderDialog
        open={createFolderOpen}
        onClose={() => {
          setCreateFolderOpen(false);
          setSubfolderParentId(null);
        }}
        onConfirm={async (title) => {
          // 如果有指定父文件夹，在目标文件夹下创建
          if (subfolderParentId) {
            await ctx.createFolderIn(subfolderParentId, title);
          } else {
            await ctx.createFolder(title);
          }
          setSubfolderParentId(null);
        }}
      />
      <EditBookmarkDialog
        open={editBookmarkOpen}
        bookmark={editingBookmarkRef.current}
        onClose={() => {
          setEditBookmarkOpen(false);
          editingBookmarkRef.current = null;
        }}
        onConfirm={ctx.updateBookmark}
      />
      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        count={selectedIds.size}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={ctx.deleteSelected}
      />
    </div>
  );
}

export default function App() {
  // 需要在 GlobalDndProvider 外部获取 dockCtx
  // 所以我们创建一个内部组件来处理拖拽逻辑
  return (
    <ConfigProvider theme={genesisTheme}>
      <ViewSettingsProvider>
        <BookmarkProvider>
          <DockProvider>
            <AppWithDnd />
          </DockProvider>
        </BookmarkProvider>
      </ViewSettingsProvider>
    </ConfigProvider>
  );
}

function AppWithDnd() {
  const dockCtx = useDockContext();
  const bookmarkCtx = useBookmarkContext();
  const { viewMode } = useViewSettings();

  const handleDropToDock = useCallback(
    (ids: string[]) => {
      dockCtx.addItems(ids);
    },
    [dockCtx],
  );

  // 处理同目录内排序：先乐观更新UI，再调用API
  const handleReorder = useCallback(
    (activeId: string, overId: string) => {
      const currentItems = bookmarkCtx.currentItems;
      const overIndex = currentItems.findIndex((item) => item.id === overId);
      if (overIndex === -1) return;

      // 乐观更新UI
      bookmarkCtx.optimisticReorder(activeId, overId);

      // Chrome move API 的索引计算与 JS splice 一致，直接使用 overIndex
      bookmarkCtx.moveItems([activeId], bookmarkCtx.currentNodeId, overIndex);
    },
    [bookmarkCtx],
  );

  // 处理 Ctrl+拖拽放入文件夹
  const handleDropToFolder = useCallback(
    (ids: string[], folderId: string) => {
      bookmarkCtx.optimisticMoveIntoFolder(ids, folderId);
      bookmarkCtx.moveItems(ids, folderId);
    },
    [bookmarkCtx],
  );

  return (
    <GlobalDndProvider
      onDropToDock={handleDropToDock}
      onDropToFolder={handleDropToFolder}
      onReorder={handleReorder}
      viewMode={viewMode}
    >
      <AppContent />
    </GlobalDndProvider>
  );
}
