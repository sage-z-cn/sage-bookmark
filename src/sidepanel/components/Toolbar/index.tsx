import { Button, Tooltip } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  FolderAddOutlined,
  BookOutlined,
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
  const { selectedIds } = useBookmarkContext();
  const hasSelection = selectedIds.size > 0;
  const singleSelected = selectedIds.size === 1;

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
