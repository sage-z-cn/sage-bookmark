import { Button } from "antd";
import { AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useBookmarkContext } from "@/sidepanel/context/BookmarkContext";
import { useViewSettings } from "@/sidepanel/context/ViewSettingsContext";
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
  const { viewMode, setViewMode } = useViewSettings();

  const folderCount = currentItems.filter((i) => i.type === "folder").length;
  const bookmarkCount = currentItems.filter(
    (i) => i.type === "bookmark",
  ).length;

  return (
    <div className={styles.statusBar}>
      <span className={styles.stat}>
        {searchActive && typeof searchResultCount === "number" ? (
          <>搜索到 {searchResultCount} 个结果</>
        ) : (
          <>
            {folderCount} 个文件夹 + {bookmarkCount} 个书签
          </>
        )}
        {selectedIds.size > 0 && (
          <>
            <span className={styles.separator}>|</span>
            <span className={styles.selectedStat}>已选 {selectedIds.size} 项</span>
          </>
        )}
      </span>
      {/* 视图切换按钮 */}
      <Button
        type="text"
        size="small"
        icon={viewMode === "grid" ? <UnorderedListOutlined /> : <AppstoreOutlined />}
        onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
      />
    </div>
  );
}
