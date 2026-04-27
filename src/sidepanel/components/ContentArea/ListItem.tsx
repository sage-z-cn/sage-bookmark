import { BookOutlined, FolderOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import type { AppBookmarkNode } from "@/types/bookmark";
import { getFaviconUrl } from "@/sidepanel/services/faviconService";
import { formatDate } from "@/sidepanel/utils/format";
import HighlightText from "@/sidepanel/components/SearchBar/HighlightText";
import { useEffect, useRef, useState } from "react";
import styles from "./ContentArea.module.css";

interface ListItemProps {
  item: AppBookmarkNode;
  selected: boolean;
  cut?: boolean;
  onSelect: (multi: boolean, range: boolean) => void;
  onDoubleClick: () => void;
  renaming?: boolean;
  onRenameSubmit?: (newTitle: string) => void;
  onRenameCancel?: () => void;
  highlightQuery?: string;
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
  cut = false,
  onSelect,
  onDoubleClick,
  renaming = false,
  onRenameSubmit,
  onRenameCancel,
  highlightQuery,
}: ListItemProps) {
  const isFolder = item.type === "folder";
  const childCount = isFolder ? (item.children?.length ?? 0) : 0;
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

  // 构建 tooltip 内容
  const tooltipTitle = isFolder ? (
    <div>
      <div>{displayName}</div>
      <div style={{ opacity: 0.7, fontSize: 12 }}>
        包含 {childCount} 个项目
      </div>
    </div>
  ) : item.url ? (
    <div>
      <div>{displayName}</div>
      <div style={{ opacity: 0.7, fontSize: 12 }}>{item.url}</div>
    </div>
  ) : (
    displayName
  );

  return (
    <Tooltip title={tooltipTitle} mouseEnterDelay={0.8}>
      <div
        className={`${styles.listRow} ${selected ? styles.listRowSelected : ""} ${cut ? styles.listRowCut : ""}`}
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
            onDoubleClick={(e) => e.stopPropagation()}
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
              onDoubleClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={styles.listName}>
              {highlightQuery ? (
                <HighlightText text={displayName} query={highlightQuery} />
              ) : (
                displayName
              )}
            </span>
          )}
        </div>
        <div className={styles.listCellUrl}>{displayUrl}</div>
        <div className={styles.listCellDate}>{dateStr}</div>
      </div>
    </Tooltip>
  );
}
