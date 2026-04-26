import { BookOutlined, FolderOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import type { AppBookmarkNode } from "@/types/bookmark";
import { getFaviconUrl } from "@/sidepanel/services/faviconService";
import { formatDate } from "@/sidepanel/utils/format";
import { useEffect, useRef, useState } from "react";
import styles from "./ContentArea.module.css";

interface ListItemProps {
  item: AppBookmarkNode;
  selected: boolean;
  onSelect: (multi: boolean, range: boolean) => void;
  onDoubleClick: () => void;
  renaming?: boolean;
  onRenameSubmit?: (newTitle: string) => void;
  onRenameCancel?: () => void;
}

function FavIcon({ url }: { url?: string }) {
  const [error, setError] = useState(false);
  if (!url || error) {
    return (
      <BookOutlined
        style={{ fontSize: 16, color: "var(--color-primary)", marginRight: 8 }}
      />
    );
  }
  return (
    <img
      src={getFaviconUrl(url, 16)}
      alt=""
      className={styles.listFavicon}
      onError={() => setError(true)}
      style={{ marginRight: 8 }}
    />
  );
}

export default function ListItem({
  item,
  selected,
  onSelect,
  onDoubleClick,
  renaming = false,
  onRenameSubmit,
  onRenameCancel,
}: ListItemProps) {
  const isFolder = item.type === "folder";
  const displayUrl = !isFolder && item.url ? item.url : "—";
  const displayName =
    item.title || (isFolder ? "未命名文件夹" : item.url || "");
  const dateStr = item.dateAdded ? formatDate(item.dateAdded) : "—";
  const [editValue, setEditValue] = useState(item.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) {
      setEditValue(item.title);
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

  return (
    <Tooltip
      title={item.url ? `${displayName}\n${item.url}` : displayName}
      mouseEnterDelay={0.8}
    >
      <div
        className={`${styles.listRow} ${selected ? styles.listRowSelected : ""}`}
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
        <div className={styles.listCellCheckbox}>
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(true, false);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className={styles.listCellName}>
          {isFolder ? (
            <FolderOutlined
              style={{ fontSize: 16, color: "#F59E0B", marginRight: 8 }}
            />
          ) : (
            <FavIcon url={item.url} />
          )}
          {renaming ? (
            <input
              ref={inputRef}
              className={styles.listRenameInput}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={styles.listName}>{displayName}</span>
          )}
        </div>
        <div className={styles.listCellUrl}>{displayUrl}</div>
        <div className={styles.listCellDate}>{dateStr}</div>
      </div>
    </Tooltip>
  );
}
