import { useBookmarkContext } from "@/sidepanel/context/BookmarkContext";
import styles from "./StatusBar.module.css";

interface StatusBarProps {
  searchActive?: boolean;
  searchResultCount?: number;
}

export default function StatusBar({
  searchActive = false,
  searchResultCount,
}: StatusBarProps) {
  const { currentItems, selectedIds } = useBookmarkContext();

  const folderCount = currentItems.filter((i) => i.type === "folder").length;
  const bookmarkCount = currentItems.filter(
    (i) => i.type === "bookmark",
  ).length;
  const totalCount = currentItems.length;

  return (
    <div className={styles.statusBar}>
      <span className={styles.stat}>
        {searchActive && typeof searchResultCount === "number" ? (
          <>搜索到 {searchResultCount} 个结果</>
        ) : (
          <>
            {totalCount} 个项目
            {folderCount > 0 && `（${folderCount} 个文件夹`}
            {folderCount > 0 && bookmarkCount > 0 ? "，" : ""}
            {bookmarkCount > 0
              ? `${bookmarkCount} 个书签）`
              : folderCount > 0
                ? "）"
                : ""}
          </>
        )}
      </span>
      {selectedIds.size > 0 && (
        <span className={styles.selectedStat}>已选 {selectedIds.size} 项</span>
      )}
    </div>
  );
}
