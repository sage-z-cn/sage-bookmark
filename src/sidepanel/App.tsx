import { useCallback, useEffect, useRef, useState } from "react";
import { ConfigProvider } from "antd";
import { genesisTheme } from "./styles/token";
import {
  BookmarkProvider,
  useBookmarkContext,
} from "./context/BookmarkContext";
import AddressBar from "./components/AddressBar";
import Toolbar from "./components/Toolbar";
import ContentArea from "./components/ContentArea";
import StatusBar from "./components/StatusBar";
import ContextMenu from "./components/ContextMenu";
import CreateBookmarkDialog from "./components/Dialogs/CreateBookmarkDialog";
import CreateFolderDialog from "./components/Dialogs/CreateFolderDialog";
import EditBookmarkDialog from "./components/Dialogs/EditBookmarkDialog";
import ConfirmDeleteDialog from "./components/Dialogs/ConfirmDeleteDialog";
import type { AppBookmarkNode } from "@/types/bookmark";

function AppContent() {
  const ctx = useBookmarkContext();
  const { selectedIds, index } = ctx;

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

  // 键盘快捷键
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (e.key === "Delete") {
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
  }, [handleDelete, handleEdit, ctx]);

  // 处理新建子文件夹（从右键菜单触发）
  const handleCreateSubfolder = useCallback((parentId: string) => {
    setSubfolderParentId(parentId);
    setCreateFolderOpen(true);
  }, []);

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
      />
      <ContentArea
        renamingFolderId={renamingFolderId}
        onRenameSubmit={handleRenameSubmit}
        onRenameCancel={handleRenameCancel}
      />
      <StatusBar />

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
  return (
    <ConfigProvider theme={genesisTheme}>
      <BookmarkProvider>
        <AppContent />
      </BookmarkProvider>
    </ConfigProvider>
  );
}
