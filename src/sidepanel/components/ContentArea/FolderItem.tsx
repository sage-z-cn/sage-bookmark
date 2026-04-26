import { useEffect, useRef, useState } from "react";
import { FolderOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import type { AppBookmarkNode } from "@/types/bookmark";
import styles from "./ContentArea.module.css";

interface FolderItemProps {
  item: AppBookmarkNode;
  selected: boolean;
  onSelect: (multi: boolean, range: boolean) => void;
  onDoubleClick: () => void;
  renaming?: boolean;
  onRenameSubmit?: (newTitle: string) => void;
  onRenameCancel?: () => void;
}

export default function FolderItem({
  item,
  selected,
  onSelect,
  onDoubleClick,
  renaming = false,
  onRenameSubmit,
  onRenameCancel,
}: FolderItemProps) {
  const [editValue, setEditValue] = useState(item.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) {
      setEditValue(item.title);
      // 延迟聚焦以确保 DOM 已更新
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [renaming, item.title]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.stopPropagation();
      const trimmed = editValue.trim();
      if (trimmed && trimmed !== item.title) {
        onRenameSubmit?.(trimmed);
      } else {
        onRenameCancel?.();
      }
    } else if (e.key === "Escape") {
      e.stopPropagation();
      onRenameCancel?.();
    }
  }

  function handleBlur() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== item.title) {
      onRenameSubmit?.(trimmed);
    } else {
      onRenameCancel?.();
    }
  }

  if (renaming) {
    return (
      <div
        className={`${styles.item} ${selected ? styles.itemSelected : ""}`}
        data-item-id={item.id}
      >
        <div className={styles.itemIcon}>
          <FolderOutlined style={{ fontSize: 40, color: "#F59E0B" }} />
        </div>
        <input
          ref={inputRef}
          className={styles.renameInput}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  }

  return (
    <Tooltip title={item.title} mouseEnterDelay={0.8}>
      <div
        className={`${styles.item} ${selected ? styles.itemSelected : ""}`}
        data-item-id={item.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(e.ctrlKey || e.metaKey, e.shiftKey);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onDoubleClick();
        }}
      >
        <div className={styles.itemIcon}>
          <FolderOutlined style={{ fontSize: 40, color: "#F59E0B" }} />
        </div>
        <div className={styles.itemTitle}>{item.title}</div>
      </div>
    </Tooltip>
  );
}
