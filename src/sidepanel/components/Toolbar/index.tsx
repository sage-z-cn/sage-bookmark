import { Button } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  FolderAddOutlined,
  BookOutlined,
  ScissorOutlined,
  CopyOutlined,
  SnippetsOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useBookmarkContext } from "@/sidepanel/context/BookmarkContext";
import styles from "./Toolbar.module.css";

interface ToolbarProps {
  onCreateBookmark: () => void;
  onCreateFolder: () => void;
  onEdit: () => void;
  onDelete: () => void;
  searchActive?: boolean;
  onToggleSearch?: () => void;
}

export default function Toolbar({
  onCreateBookmark,
  onCreateFolder,
  onEdit,
  onDelete,
  searchActive = false,
  onToggleSearch,
}: ToolbarProps) {
  const { selectedIds, cut, copy, paste, canPaste } = useBookmarkContext();
  const hasSelection = selectedIds.size > 0;
  const singleSelected = selectedIds.size === 1;

  return (
    <div className={styles.toolbar}>
      <Button
        type="text"
        size="small"
        icon={<BookOutlined />}
        onClick={onCreateBookmark}
      />
      <Button
        type="text"
        size="small"
        icon={<FolderAddOutlined />}
        onClick={onCreateFolder}
      />

      <div className={styles.separator} />

      <Button
        type="text"
        size="small"
        icon={<ScissorOutlined />}
        disabled={!hasSelection}
        onClick={cut}
      />
      <Button
        type="text"
        size="small"
        icon={<CopyOutlined />}
        disabled={!hasSelection}
        onClick={copy}
      />
      <Button
        type="text"
        size="small"
        icon={<SnippetsOutlined />}
        disabled={!canPaste}
        onClick={paste}
      />

      <div className={styles.separator} />

      <Button
        type="text"
        size="small"
        icon={<EditOutlined />}
        disabled={!singleSelected}
        onClick={onEdit}
      />

      <Button
        type="text"
        size="small"
        danger
        icon={<DeleteOutlined />}
        disabled={!hasSelection}
        onClick={onDelete}
      />

      <div className={styles.spacer} />

      {/* 搜索按钮 */}
      <Button
        type="text"
        size="small"
        icon={<SearchOutlined />}
        className={searchActive ? styles.searchActive : ""}
        onClick={onToggleSearch}
      />
    </div>
  );
}
