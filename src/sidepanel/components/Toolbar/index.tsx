import { Button, Tooltip } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  FolderAddOutlined,
  BookOutlined,
  ScissorOutlined,
  CopyOutlined,
  SnippetsOutlined,
} from "@ant-design/icons";
import { useBookmarkContext } from "@/sidepanel/context/BookmarkContext";
import styles from "./Toolbar.module.css";

interface ToolbarProps {
  onCreateBookmark: () => void;
  onCreateFolder: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function Toolbar({
  onCreateBookmark,
  onCreateFolder,
  onEdit,
  onDelete,
}: ToolbarProps) {
  const { selectedIds, clipboard, cut, copy, paste, canPaste } =
    useBookmarkContext();
  const hasSelection = selectedIds.size > 0;
  const singleSelected = selectedIds.size === 1;

  // 剪切状态指示：被剪切的项目应显示视觉提示
  const isCutState =
    clipboard?.action === "cut" &&
    clipboard.ids.some((id) => selectedIds.has(id));

  return (
    <div className={styles.toolbar}>
      <Tooltip title="新建书签">
        <Button
          type="text"
          size="small"
          icon={<BookOutlined />}
          onClick={onCreateBookmark}
        />
      </Tooltip>
      <Tooltip title="新建文件夹">
        <Button
          type="text"
          size="small"
          icon={<FolderAddOutlined />}
          onClick={onCreateFolder}
        />
      </Tooltip>

      <div className={styles.separator} />

      <Tooltip title={hasSelection ? "剪切 (Ctrl+X)" : "选择项目以剪切"}>
        <Button
          type="text"
          size="small"
          icon={<ScissorOutlined />}
          disabled={!hasSelection}
          onClick={cut}
        />
      </Tooltip>
      <Tooltip title={hasSelection ? "复制 (Ctrl+C)" : "选择项目以复制"}>
        <Button
          type="text"
          size="small"
          icon={<CopyOutlined />}
          disabled={!hasSelection}
          onClick={copy}
        />
      </Tooltip>
      <Tooltip title={canPaste ? "粘贴 (Ctrl+V)" : "无内容可粘贴"}>
        <Button
          type="text"
          size="small"
          icon={<SnippetsOutlined />}
          disabled={!canPaste}
          onClick={paste}
        />
      </Tooltip>

      <div className={styles.separator} />

      <Tooltip title={singleSelected ? "编辑 (F2)" : "选择一个项目以编辑"}>
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          disabled={!singleSelected}
          onClick={onEdit}
        />
      </Tooltip>

      <Tooltip
        title={
          hasSelection ? `删除 (${selectedIds.size} 项)` : "选择项目以删除"
        }
      >
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          disabled={!hasSelection}
          onClick={onDelete}
        />
      </Tooltip>
    </div>
  );
}
