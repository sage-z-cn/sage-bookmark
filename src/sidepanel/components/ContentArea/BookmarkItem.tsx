import { useState } from "react";
import { BookOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import type { AppBookmarkNode } from "@/types/bookmark";
import { getFaviconUrl } from "@/sidepanel/services/faviconService";
import styles from "./ContentArea.module.css";

interface BookmarkItemProps {
  item: AppBookmarkNode;
  selected: boolean;
  onSelect: (multi: boolean) => void;
  onDoubleClick: () => void;
}

export default function BookmarkItem({
  item,
  selected,
  onSelect,
  onDoubleClick,
}: BookmarkItemProps) {
  const [faviconError, setFaviconError] = useState(false);
  const faviconSrc =
    item.url && !faviconError ? getFaviconUrl(item.url, 32) : undefined;

  return (
    <Tooltip title={item.title} mouseEnterDelay={0.8}>
      <div
        className={`${styles.item} ${selected ? styles.itemSelected : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(e.ctrlKey || e.metaKey);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onDoubleClick();
        }}
      >
        <div className={styles.itemIcon}>
          {faviconSrc ? (
            <img
              src={faviconSrc}
              alt=""
              className={styles.favicon}
              onError={() => setFaviconError(true)}
            />
          ) : (
            <BookOutlined className={styles.fallbackIcon} />
          )}
        </div>
        <div className={styles.itemTitle}>{item.title}</div>
      </div>
    </Tooltip>
  );
}
