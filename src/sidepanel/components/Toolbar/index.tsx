import { Button, Dropdown, message } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  FolderAddOutlined,
  BookOutlined,
  ScissorOutlined,
  CopyOutlined,
  SnippetsOutlined,
  SearchOutlined,
  ExportOutlined,
  ImportOutlined,
  MoreOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import { useBookmarkContext } from "@/sidepanel/context/BookmarkContext";
import { useTheme } from "@/sidepanel/context/ThemeContext";
import { useRef } from "react";
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
  const {
    selectedIds,
    cut,
    copy,
    paste,
    canPaste,
    index,
    currentNodeId,
    exportAsJson,
    importFromJson,
  } = useBookmarkContext();
  const { theme, toggleTheme } = useTheme();
  const hasSelection = selectedIds.size > 0;
  const singleSelected = selectedIds.size === 1;
  const importInputRef = useRef<HTMLInputElement>(null);

  // 获取导出目标：选中的单个文件夹，或当前目录
  const getExportTarget = (): string => {
    if (singleSelected && index) {
      const node = index.nodeMap.get([...selectedIds][0]);
      if (node?.type === "folder") return node.id;
    }
    return currentNodeId;
  };

  const handleExport = async () => {
    try {
      await exportAsJson(getExportTarget());
      message.success("导出成功");
    } catch {
      message.error("导出失败");
    }
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importFromJson(file, currentNodeId);
      message.success("导入成功");
    } catch {
      message.error("导入失败，请检查 JSON 文件格式");
    }
    // 重置 input 以允许重复选择同一文件
    e.target.value = "";
  };

  const moreMenuItems = [
    {
      key: "export",
      icon: <ExportOutlined />,
      label: "导出书签",
      onClick: handleExport,
    },
    {
      key: "import",
      icon: <ImportOutlined />,
      label: "导入书签",
      onClick: handleImportClick,
    },
    { type: "divider" as const, key: "d1" },
    {
      key: "theme",
      icon: theme === "dark" ? <SunOutlined /> : <MoonOutlined />,
      label: theme === "dark" ? "亮色模式" : "暗色模式",
      onClick: toggleTheme,
    },
  ];

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

      {/* 更多操作：导出/导入 */}
      <Dropdown menu={{ items: moreMenuItems }} trigger={["click"]}>
        <Button type="text" size="small" icon={<MoreOutlined />} />
      </Dropdown>

      {/* 隐藏的文件输入，用于导入 */}
      <input
        ref={importInputRef}
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleImportFile}
      />
    </div>
  );
}
