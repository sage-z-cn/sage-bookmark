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

  // 正在编辑的书签
  const editingBookmarkRef = useRef<AppBookmarkNode | null>(null);

  // 获取唯一选中项
  const singleSelectedItem =
    selectedIds.size === 1 && index
      ? (index.nodeMap.get([...selectedIds][0]) ?? null)
      : null;

  // 处理编辑操作：书签弹 Modal，文件夹行内重命名
  const handleEdit = useCallback(() => {
    if (!singleSelectedItem) return;
    if (singleSelectedItem.type === "folder") {
      setRenamingFolderId(singleSelectedItem.id);
    } else {
      editingBookmarkRef.current = singleSelectedItem;
      setEditBookmarkOpen(true);
    }
  }, [singleSelectedItem]);

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
      // 忽略在 input/textarea 中的按键
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "Delete") {
        e.preventDefault();
        handleDelete();
      } else if (e.key === "F2") {
        e.preventDefault();
        handleEdit();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDelete, handleEdit]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <AddressBar />
      <Toolbar
        onCreateBookmark={() => setCreateBookmarkOpen(true)}
        onCreateFolder={() => setCreateFolderOpen(true)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <ContentArea
        renamingFolderId={renamingFolderId}
        onRenameSubmit={handleRenameSubmit}
        onRenameCancel={handleRenameCancel}
      />
      <StatusBar />

      {/* 对话框 */}
      <CreateBookmarkDialog
        open={createBookmarkOpen}
        onClose={() => setCreateBookmarkOpen(false)}
        onConfirm={ctx.createBookmark}
      />
      <CreateFolderDialog
        open={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        onConfirm={ctx.createFolder}
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
