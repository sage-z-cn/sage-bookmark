import { Spin } from "antd";
import { useBookmarkContext } from "@/sidepanel/context/BookmarkContext";
import FolderItem from "./FolderItem";
import BookmarkItem from "./BookmarkItem";
import styles from "./ContentArea.module.css";

export default function ContentArea() {
  const {
    loading,
    currentItems,
    selectedIds,
    toggleSelect,
    clearSelection,
    navigateTo,
  } = useBookmarkContext();

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin />
      </div>
    );
  }

  if (currentItems.length === 0) {
    return <div className={styles.empty}>此文件夹为空</div>;
  }

  function handleBackgroundClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).dataset.area === "content") {
      clearSelection();
    }
  }

  function handleDoubleClick(item: (typeof currentItems)[number]) {
    if (item.type === "folder") {
      navigateTo(item.id);
    } else if (item.url) {
      window.open(item.url, "_blank");
    }
  }

  return (
    <div
      className={styles.contentArea}
      data-area="content"
      onClick={handleBackgroundClick}
    >
      <div className={styles.grid}>
        {currentItems.map((item) =>
          item.type === "folder" ? (
            <FolderItem
              key={item.id}
              item={item}
              selected={selectedIds.has(item.id)}
              onSelect={(multi) => toggleSelect(item.id, multi)}
              onDoubleClick={() => handleDoubleClick(item)}
            />
          ) : (
            <BookmarkItem
              key={item.id}
              item={item}
              selected={selectedIds.has(item.id)}
              onSelect={(multi) => toggleSelect(item.id, multi)}
              onDoubleClick={() => handleDoubleClick(item)}
            />
          ),
        )}
      </div>
    </div>
  );
}
