import { memo } from "react";
import type { DockItem as DockItemType } from "@/sidepanel/hooks/useDock";
import styles from "./DockBar.module.css";

interface DockItemProps {
  item: DockItemType;
  onRemove: (id: string) => void;
}

const DockItem = memo(function DockItem({ item, onRemove }: DockItemProps) {
  return (
    <div className={styles.dockItem}>
      <button
        type="button"
        className={styles.removeButton}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item.id);
        }}
        aria-label="移除"
      >
        ×
      </button>
      <div className={styles.itemIcon}>
        {item.type === "folder" ? (
          <span className={styles.folderIcon}>📁</span>
        ) : item.faviconUrl ? (
          <img
            src={item.faviconUrl}
            alt=""
            className={styles.itemFavicon}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className={styles.itemFallbackIcon}>🔗</span>
        )}
      </div>
      <span className={styles.itemTitle} title={item.title}>
        {item.title}
      </span>
    </div>
  );
});

export default DockItem;
