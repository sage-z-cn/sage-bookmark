import { useState } from "react";
import { BookOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import type { AppBookmarkNode } from "@/types/bookmark";
import { getFaviconUrl } from "@/sidepanel/services/faviconService";
import { truncateUrl } from "@/sidepanel/utils/format";
import HighlightText from "@/sidepanel/components/SearchBar/HighlightText";
import styles from "./ContentArea.module.css";

interface BookmarkItemProps {
  item: AppBookmarkNode;
  selected: boolean;
  onSelect: (multi: boolean, range: boolean) => void;
  onDoubleClick: () => void;
  highlightQuery?: string;
}

export default function BookmarkItem({
  item,
  selected,
  onSelect,
  onDoubleClick,
  highlightQuery,
}: BookmarkItemProps) {
  const [faviconError, setFaviconError] = useState(false);
  const faviconSrc =
    item.url && !faviconError ? getFaviconUrl(item.url, 32) : undefined;
  const displayName = item.title || (item.url ? truncateUrl(item.url) : "");

  return (
    <Tooltip
      title={
        item.url ? (
          <div>
            {item.title && <div>{item.title}</div>}
            <div style={{ opacity: item.title ? 0.7 : 1, fontSize: 12 }}>
              {item.url}
            </div>
          </div>
        ) : (
          item.title
        )
      }
      mouseEnterDelay={0.8}
    >
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
        <div className={styles.itemTitle}>
          {highlightQuery ? (
            <HighlightText text={displayName} query={highlightQuery} />
          ) : (
            displayName
          )}
        </div>
      </div>
    </Tooltip>
  );
}
